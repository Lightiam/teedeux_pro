import { Router } from 'express';
import { z } from 'zod';
import { aisles, orders, products, stores } from '../repository.js';
import { optionalAuth, type AuthedRequest } from '../auth.js';
import { ApiError, asyncHandler } from '../http.js';
import { PRODUCT_CATEGORIES } from '../types.js';

export const catalogRouter = Router();

const listQuerySchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  category: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]]).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

catalogRouter.get(
  '/stores',
  asyncHandler(async (_req, res) => {
    res.json({ stores: await stores.all() });
  })
);

catalogRouter.get(
  '/stores/:storeId',
  asyncHandler(async (req, res) => {
    const store = await stores.byId(String(req.params.storeId));
    if (!store) throw ApiError.notFound('No such hub');

    res.json({
      store,
      products: await products.query({ storeId: store.id, limit: 200 }),
    });
  })
);

catalogRouter.get(
  '/aisles',
  asyncHandler(async (_req, res) => {
    res.json({ aisles: await aisles.all() });
  })
);

catalogRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);

    const [list, total] = await Promise.all([
      products.query(query),
      products.count(query),
    ]);

    res.json({ products: list, total, limit: query.limit, offset: query.offset });
  })
);

catalogRouter.get(
  '/products/:productId',
  asyncHandler(async (req, res) => {
    const product = await products.byId(String(req.params.productId));
    if (!product) throw ApiError.notFound('No such product');
    res.json({ product });
  })
);

/**
 * Buy-it-again. Signed-in shoppers get their real order history; anonymous
 * callers get an empty list rather than a 401, so the rail can render for
 * everyone and simply stay hidden when there is nothing to show.
 */
catalogRouter.get(
  '/buy-it-again',
  optionalAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.uid) {
      res.json({ products: [] });
      return;
    }

    const ids = await orders.previouslyOrderedProductIds(req.uid);
    const productMap = await products.byIds(ids);

    // Preserve recency order, dropping anything no longer in the catalog.
    const resolved = ids
      .map((id) => productMap.get(id))
      .filter((product): product is NonNullable<typeof product> => product !== undefined);

    res.json({ products: resolved });
  })
);
