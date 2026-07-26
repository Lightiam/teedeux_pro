import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../config.js';
import { db, round2 } from '../firestore.js';
import { carts, orders, users } from '../repository.js';
import { currentUid, requireAuth, type AuthedRequest } from '../auth.js';
import { ApiError, asyncHandler } from '../http.js';
import { priceOrder } from '../pricing.js';
import { ORDER_FLOW, type OrderItem, type OrderStatus } from '../types.js';

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
    res.json({ orders: await orders.listFor(currentUid(req)) });
  })
);

orderRouter.get(
  '/:orderId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await orders.byId(currentUid(req), String(req.params.orderId));
    if (!order) throw ApiError.notFound('No such order');
    res.json({ order });
  })
);

/**
 * Turns cart contents into orders — one per fulfilment hub, because hubs ship
 * independently. Prices are read from the catalog at this moment and copied
 * onto the order, so a later catalog change never rewrites order history.
 *
 * The write is a single Firestore transaction: order documents, cart deletions
 * and the loyalty-point award either all land or none do. Reads happen before
 * the transaction opens because Firestore requires all transactional reads to
 * precede any write.
 */
orderRouter.post(
  '/checkout',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = checkoutSchema.parse(req.body);
    const uid = currentUid(req);

    const profile = await users.publicById(uid);
    if (!profile) throw ApiError.unauthorized('Account has no profile yet', 'no_profile');

    const address = body.deliveryAddress ?? profile.defaultAddress;
    if (!address) {
      throw ApiError.badRequest(
        'A delivery address is required to check out',
        'address_required'
      );
    }

    const allCarts = await carts.groupedFor(uid);
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
    const orderIds: string[] = [];
    let pointsAwarded = 0;

    await db.runTransaction(async (tx) => {
      for (const cart of target) {
        // Each hub is priced on its own subtotal, so free delivery and the
        // promo apply per shipment rather than to some combined figure.
        const totals = priceOrder(cart.subtotal, body.promoCode);
        const orderRef = db.collection(COLLECTIONS.orders).doc();

        const items: OrderItem[] = cart.items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          weightOrUnit: item.product.weightOrUnit,
          unitPrice: item.product.price,
          quantity: item.quantity,
        }));

        tx.set(orderRef, {
          userId: uid,
          storeId: cart.store.id,
          storeName: cart.store.name,
          storeImageUrl: cart.store.imageUrl,
          status: 'placed' satisfies OrderStatus,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          serviceFee: totals.serviceFee,
          discount: totals.discount,
          total: totals.total,
          deliveryAddress: address,
          placedAt: now,
          updatedAt: now,
          items,
        });

        for (const item of cart.items) {
          tx.delete(carts.lineRef(uid, item.product.id));
        }

        // A point per whole dollar spent, matching the profile screen's copy.
        pointsAwarded += Math.floor(totals.total);
        orderIds.push(orderRef.id);
      }

      tx.update(db.collection(COLLECTIONS.users).doc(uid), {
        loyaltyPoints: FieldValue.increment(pointsAwarded),
      });
    });

    const placed = (await Promise.all(orderIds.map((id) => orders.byId(uid, id)))).filter(
      (order): order is NonNullable<typeof order> => order !== null
    );

    res.status(201).json({
      orders: placed,
      grandTotal: round2(placed.reduce((sum, order) => sum + order.total, 0)),
    });
  })
);

/**
 * Moves an order along its lifecycle. Standing in for the courier and
 * warehouse systems that would drive this in production.
 */
orderRouter.post(
  '/:orderId/status',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = advanceSchema.parse(req.body);
    const uid = currentUid(req);
    const orderId = String(req.params.orderId);
    const ref = db.collection(COLLECTIONS.orders).doc(orderId);

    // Read and write inside one transaction so two concurrent advances cannot
    // both pass the legality check.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.userId !== uid) {
        throw ApiError.notFound('No such order');
      }

      const current = String(snap.data()?.status) as OrderStatus;
      if (current === 'delivered' || current === 'cancelled') {
        throw ApiError.conflict(`Order is already ${current}`, 'order_final');
      }

      assertLegalTransition(current, body.status);
      tx.update(ref, { status: body.status, updatedAt: new Date().toISOString() });
    });

    res.json({ order: await orders.byId(uid, orderId) });
  })
);

/** Orders may be cancelled at any point, but otherwise only move forwards. */
function assertLegalTransition(from: OrderStatus, to: OrderStatus): void {
  if (to === 'cancelled') return;

  const fromIndex = ORDER_FLOW.indexOf(from);
  const toIndex = ORDER_FLOW.indexOf(to);

  if (toIndex <= fromIndex) {
    throw ApiError.conflict(
      `Cannot move an order from ${from} back to ${to}`,
      'invalid_transition'
    );
  }
}
