import { Router } from 'express';
import { z } from 'zod';
import { carts, products, round2, stores } from '../repository.ts';
import { currentUserId, requireAuth, type AuthedRequest } from '../auth.ts';
import { ApiError, asyncHandler } from '../http.ts';
import { isValidPromoCode, priceOrder } from '../pricing.ts';

export const cartRouter = Router();

// Every cart route needs a signed-in shopper.
cartRouter.use(requireAuth);

const addSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

const setSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

const promoQuerySchema = z.object({
  promoCode: z.string().trim().max(40).optional(),
});

/** Shape returned by every cart mutation, so clients re-render from one payload. */
function cartResponse(userId: string, promoCode?: string) {
  const storeCarts = carts.groupedFor(userId);
  const subtotal = round2(storeCarts.reduce((sum, cart) => sum + cart.subtotal, 0));

  return {
    carts: storeCarts,
    itemCount: storeCarts.reduce((sum, cart) => sum + cart.itemCount, 0),
    totals: priceOrder(subtotal, promoCode),
    promoCode: promoCode ? promoCode.trim().toUpperCase() : null,
    promoValid: promoCode ? isValidPromoCode(promoCode) : null,
  };
}

cartRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { promoCode } = promoQuerySchema.parse(req.query);
    res.json(cartResponse(currentUserId(req), promoCode));
  })
);

cartRouter.post(
  '/items',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = addSchema.parse(req.body);
    const userId = currentUserId(req);

    if (!products.byId(body.productId)) {
      throw ApiError.notFound('No such product');
    }

    carts.addQuantity(userId, body.productId, body.quantity);
    res.status(201).json(cartResponse(userId));
  })
);

cartRouter.patch(
  '/items/:productId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = setSchema.parse(req.body);
    const userId = currentUserId(req);
    const productId = String(req.params.productId);

    if (!products.byId(productId)) {
      throw ApiError.notFound('No such product');
    }

    // Quantity 0 is the documented way to remove a line.
    carts.setQuantity(userId, productId, body.quantity);
    res.json(cartResponse(userId));
  })
);

cartRouter.delete(
  '/items/:productId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = currentUserId(req);
    carts.remove(userId, String(req.params.productId));
    res.json(cartResponse(userId));
  })
);

cartRouter.delete(
  '/stores/:storeId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = currentUserId(req);
    const storeId = String(req.params.storeId);

    if (!stores.byId(storeId)) {
      throw ApiError.notFound('No such hub');
    }

    carts.clearStore(userId, storeId);
    res.json(cartResponse(userId));
  })
);

cartRouter.delete(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const userId = currentUserId(req);
    carts.clear(userId);
    res.json(cartResponse(userId));
  })
);
