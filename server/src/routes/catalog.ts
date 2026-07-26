import { Router } from 'express';
import { z } from 'zod';
import { aisles, orders, products, stores } from '../repository.ts';
import { optionalAuth, type AuthedRequest } from '../auth.ts';
import { ApiError, asyncHandler } from '../http.ts';

export const catalogRouter = Router();

const listQuerySchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  category: z
    .enum(['spices', 'grains', 'produce', 'seafood', 'meat', 'snacks'])
    .optional(),
  search: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

catalogRouter.get(
  '/stores',
  asyncHandler(async (_req, res) => {
    res.json({ stores: stores.all() });
  })
);

catalogRouter.get(
  '/stores/:storeId',
  asyncHandler(async (req, res) => {
    const store = stores.byId(String(req.params.storeId));
    if (!store) throw ApiError.notFound('No such hub');

    res.json({
      store,
      products: products.query({ storeId: store.id, limit: 200 }),
    });
  })
);

catalogRouter.get(
  '/aisles',
  asyncHandler(async (_req, res) => {
    res.json({ aisles: aisles.all() });
  })
);

catalogRouter.get(
  '/products',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);

    res.json({
      products: products.query(query),
      total: products.count(query),
      limit: query.limit,
      offset: query.offset,
    });
  })
);

catalogRouter.get(
  '/products/:productId',
  asyncHandler(async (req, res) => {
    const product = products.byId(String(req.params.productId));
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
    if (!req.userId) {
      res.json({ products: [] });
      return;
    }

    const ids = orders.previouslyOrderedProductIds(req.userId);
    const resolved = ids
      .map((id) => products.byId(id))
      .filter((product): product is NonNullable<typeof product> => product !== null);

    res.json({ products: resolved });
  })
);
