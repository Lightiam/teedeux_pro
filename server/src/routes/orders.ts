import { Router } from 'express';
import { z } from 'zod';
import { db, transaction } from '../db.ts';
import { carts, orders, round2, users } from '../repository.ts';
import { currentUserId, newId, requireAuth, type AuthedRequest } from '../auth.ts';
import { ApiError, asyncHandler } from '../http.ts';
import { priceOrder } from '../pricing.ts';
import { ORDER_FLOW, type OrderStatus } from '../types.ts';

export const orderRouter = Router();

orderRouter.use(requireAuth);

const checkoutSchema = z.object({
  /** Omit to check out every hub cart at once. */
  storeId: z.string().trim().min(1).optional(),
  deliveryAddress: z.string().trim().min(5).max(200).optional(),
  promoCode: z.string().trim().max(40).optional(),
});

const advanceSchema = z.object({
  status: z.enum(['placed', 'shopping', 'packed', 'in_transit', 'delivered', 'cancelled']),
});

orderRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ orders: orders.listFor(currentUserId(req)) });
  })
);

orderRouter.get(
  '/:orderId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = orders.byId(currentUserId(req), String(req.params.orderId));
    if (!order) throw ApiError.notFound('No such order');
    res.json({ order });
  })
);

/**
 * Turns cart contents into orders — one per fulfilment hub, because hubs ship
 * independently. Prices are read from the catalog at this moment and copied
 * onto the order, so a later catalog change never rewrites order history.
 */
orderRouter.post(
  '/checkout',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = checkoutSchema.parse(req.body);
    const userId = currentUserId(req);

    const userRow = users.byId(userId);
    if (!userRow) throw ApiError.unauthorized('Account no longer exists');

    const address =
      body.deliveryAddress ??
      (typeof userRow.default_address === 'string' ? userRow.default_address : null);

    if (!address) {
      throw ApiError.badRequest(
        'A delivery address is required to check out',
        'address_required'
      );
    }

    const allCarts = carts.groupedFor(userId);
    const target = body.storeId
      ? allCarts.filter((cart) => cart.store.id === body.storeId)
      : allCarts;

    if (target.length === 0) {
      throw ApiError.badRequest(
        body.storeId ? 'That hub has no items in your cart' : 'Your cart is empty',
        'empty_cart'
      );
    }

    const now = new Date().toISOString();

    const created = transaction(() => {
      const results = [];

      for (const cart of target) {
        // Each hub is priced on its own subtotal, so free-delivery and the
        // promo apply per shipment rather than to some combined figure.
        const totals = priceOrder(cart.subtotal, body.promoCode);
        const orderId = newId('ord');

        db.prepare(
          `INSERT INTO orders (id, user_id, store_id, status, subtotal, delivery_fee,
                               service_fee, discount, total, delivery_address,
                               placed_at, updated_at)
           VALUES (?, ?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          orderId,
          userId,
          cart.store.id,
          totals.subtotal,
          totals.deliveryFee,
          totals.serviceFee,
          totals.discount,
          totals.total,
          address,
          now,
          now
        );

        const insertItem = db.prepare(
          `INSERT INTO order_items (order_id, product_id, name, image_url,
                                    weight_or_unit, unit_price, quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        for (const item of cart.items) {
          insertItem.run(
            orderId,
            item.product.id,
            item.product.name,
            item.product.imageUrl,
            item.product.weightOrUnit,
            item.product.price,
            item.quantity
          );
        }

        carts.clearStore(userId, cart.store.id);

        // A point per whole dollar spent, matching the profile screen's copy.
        db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(
          Math.floor(totals.total),
          userId
        );

        results.push(orderId);
      }

      return results;
    });

    const placed = created
      .map((id) => orders.byId(userId, id))
      .filter((order): order is NonNullable<typeof order> => order !== null);

    res.status(201).json({
      orders: placed,
      grandTotal: round2(placed.reduce((sum, order) => sum + order.total, 0)),
    });
  })
);

/**
 * Moves an order along its lifecycle. Standing in for the courier/warehouse
 * systems that would drive this in production, so the tracking screen has real
 * state to render.
 */
orderRouter.post(
  '/:orderId/status',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = advanceSchema.parse(req.body);
    const userId = currentUserId(req);
    const orderId = String(req.params.orderId);

    const order = orders.byId(userId, orderId);
    if (!order) throw ApiError.notFound('No such order');

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw ApiError.conflict(`Order is already ${order.status}`, 'order_final');
    }

    assertLegalTransition(order.status, body.status);

    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(
      body.status,
      new Date().toISOString(),
      orderId
    );

    res.json({ order: orders.byId(userId, orderId) });
  })
);

/** Orders may be cancelled at any point, but otherwise only move forwards. */
function assertLegalTransition(from: OrderStatus, to: OrderStatus): void {
  if (to === 'cancelled') return;

  const fromIndex = ORDER_FLOW.indexOf(from);
  const toIndex = ORDER_FLOW.indexOf(to);

  if (toIndex <= fromIndex) {
    throw ApiError.conflict(`Cannot move an order from ${from} back to ${to}`, 'invalid_transition');
  }
}
