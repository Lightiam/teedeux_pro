import { Router } from 'express';
import { z } from 'zod';
import { carts, products, stores } from '../repository.js';
import { round2 } from '../firestore.js';
import { currentUid, requireAuth, type AuthedRequest } from '../auth.js';
import { ApiError, asyncHandler } from '../http.js';
import { isValidPromoCode, priceOrder } from '../pricing.js';

export const cartRouter = Router();

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
async function cartResponse(uid: string, promoCode?: string) {
  const storeCarts = await carts.groupedFor(uid);
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
    res.json(await cartResponse(currentUid(req), promoCode));
  })
);

cartRouter.post(
  '/items',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = addSchema.parse(req.body);
    const uid = currentUid(req);

    if (!(await products.byId(body.productId))) {
      throw ApiError.notFound('No such product');
    }

    await carts.addQuantity(uid, body.productId, body.quantity);
    res.status(201).json(await cartResponse(uid));
  })
);

cartRouter.patch(
  '/items/:productId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = setSchema.parse(req.body);
    const uid = currentUid(req);
    const productId = String(req.params.productId);

    if (!(await products.byId(productId))) {
      throw ApiError.notFound('No such product');
    }

    // Quantity 0 is the documented way to remove a line.
    await carts.setQuantity(uid, productId, body.quantity);
    res.json(await cartResponse(uid));
  })
);

cartRouter.delete(
  '/items/:productId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = currentUid(req);
    await carts.remove(uid, String(req.params.productId));
    res.json(await cartResponse(uid));
  })
);

cartRouter.delete(
  '/stores/:storeId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = currentUid(req);
    const storeId = String(req.params.storeId);

    if (!(await stores.byId(storeId))) {
      throw ApiError.notFound('No such hub');
    }

    await carts.clearStore(uid, storeId);
    res.json(await cartResponse(uid));
  })
);

cartRouter.delete(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = currentUid(req);
    await carts.clear(uid);
    res.json(await cartResponse(uid));
  })
);
