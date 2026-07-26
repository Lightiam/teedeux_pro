import { db } from './db.ts';
import type {
  Aisle,
  CartItem,
  Order,
  OrderItem,
  Product,
  ProductCategory,
  PublicUser,
  Store,
  StoreCart,
} from './types.ts';

/** node:sqlite hands back plain objects with unknown-typed columns. */
type Row = Record<string, unknown>;

/** What node:sqlite accepts as a bound statement parameter. */
type SqlParam = string | number | bigint | null | Uint8Array;

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback;
const bool = (value: unknown): boolean => value === 1 || value === true;
const nullableStr = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

function parseTags(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

export function toStore(row: Row): Store {
  return {
    id: str(row.id),
    name: str(row.name),
    rating: num(row.rating),
    deliveryTime: str(row.delivery_time),
    deliveryFee: str(row.delivery_fee),
    minOrder: str(row.min_order),
    tagline: str(row.tagline),
    imageUrl: str(row.image_url),
    isFeatured: bool(row.is_featured),
    categoryTags: parseTags(row.category_tags),
  };
}

export function toProduct(row: Row): Product {
  return {
    id: str(row.id),
    name: str(row.name),
    category: str(row.category) as ProductCategory,
    price: num(row.price),
    currency: str(row.currency, '$'),
    weightOrUnit: str(row.weight_or_unit),
    imageUrl: str(row.image_url),
    isNewArrival: bool(row.is_new_arrival),
    storeId: str(row.store_id),
    storeName: str(row.store_name),
    description: nullableStr(row.description),
  };
}

export function toPublicUser(row: Row): PublicUser {
  return {
    id: str(row.id),
    name: str(row.name),
    email: str(row.email),
    phone: nullableStr(row.phone),
    avatarUrl: nullableStr(row.avatar_url),
    isPlusMember: bool(row.is_plus_member),
    walletBalance: num(row.wallet_balance),
    loyaltyPoints: num(row.loyalty_points),
    defaultAddress: nullableStr(row.default_address),
  };
}

/** Products always carry their store's name, so every read joins stores. */
const PRODUCT_SELECT = `
  SELECT p.*, s.name AS store_name
  FROM products p
  JOIN stores s ON s.id = p.store_id
`;

export const stores = {
  all(): Store[] {
    return (db.prepare('SELECT * FROM stores ORDER BY is_featured DESC, name').all() as Row[]).map(
      toStore
    );
  },

  byId(id: string): Store | null {
    const row = db.prepare('SELECT * FROM stores WHERE id = ?').get(id) as Row | undefined;
    return row ? toStore(row) : null;
  },
};

export interface ProductQuery {
  storeId?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const products = {
  query({ storeId, category, search, limit = 100, offset = 0 }: ProductQuery): Product[] {
    const where: string[] = [];
    const params: SqlParam[] = [];

    if (storeId) {
      where.push('p.store_id = ?');
      params.push(storeId);
    }
    if (category) {
      where.push('p.category = ?');
      params.push(category);
    }
    if (search) {
      // Matched against the fields a shopper would actually type.
      where.push('(p.name LIKE ? OR p.description LIKE ? OR s.name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const sql = `
      ${PRODUCT_SELECT}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY p.is_new_arrival DESC, p.name
      LIMIT ? OFFSET ?
    `;

    return (db.prepare(sql).all(...params, limit, offset) as Row[]).map(toProduct);
  },

  count({ storeId, category, search }: ProductQuery): number {
    const where: string[] = [];
    const params: SqlParam[] = [];

    if (storeId) {
      where.push('p.store_id = ?');
      params.push(storeId);
    }
    if (category) {
      where.push('p.category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ? OR s.name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const sql = `
      SELECT COUNT(*) AS n
      FROM products p
      JOIN stores s ON s.id = p.store_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    `;
    const row = db.prepare(sql).get(...params) as Row | undefined;
    return num(row?.n);
  },

  byId(id: string): Product | null {
    const row = db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as Row | undefined;
    return row ? toProduct(row) : null;
  },
};

export const aisles = {
  all(): Aisle[] {
    const rows = db.prepare('SELECT * FROM aisles ORDER BY position').all() as Row[];
    return rows.map((row) => ({
      id: str(row.id) as ProductCategory,
      label: str(row.label),
      icon: str(row.icon),
      tint: str(row.tint),
    }));
  },
};

export const users = {
  byEmail(email: string): Row | null {
    return (db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Row) ?? null;
  },

  byId(id: string): Row | null {
    return (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row) ?? null;
  },

  publicById(id: string): PublicUser | null {
    const row = users.byId(id);
    return row ? toPublicUser(row) : null;
  },
};

export const carts = {
  /** Raw cart rows joined to their product, ordered so grouping is stable. */
  itemsFor(userId: string): CartItem[] {
    const sql = `
      SELECT p.*, s.name AS store_name, c.quantity
      FROM cart_items c
      JOIN products p ON p.id = c.product_id
      JOIN stores   s ON s.id = p.store_id
      WHERE c.user_id = ?
      ORDER BY s.name, p.name
    `;
    return (db.prepare(sql).all(userId) as Row[]).map((row) => ({
      product: toProduct(row),
      quantity: num(row.quantity),
    }));
  },

  /** Groups the flat cart into one cart per fulfilment hub. */
  groupedFor(userId: string): StoreCart[] {
    const items = carts.itemsFor(userId);
    const byStore = new Map<string, CartItem[]>();

    for (const item of items) {
      const bucket = byStore.get(item.product.storeId);
      if (bucket) bucket.push(item);
      else byStore.set(item.product.storeId, [item]);
    }

    const result: StoreCart[] = [];
    for (const [storeId, storeItems] of byStore) {
      const store = stores.byId(storeId);
      if (!store) continue;

      result.push({
        store,
        items: storeItems,
        itemCount: storeItems.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: round2(storeItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)),
      });
    }
    return result;
  },

  setQuantity(userId: string, productId: string, quantity: number): void {
    if (quantity <= 0) {
      carts.remove(userId, productId);
      return;
    }
    db.prepare(
      `INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, product_id)
       DO UPDATE SET quantity = excluded.quantity, updated_at = excluded.updated_at`
    ).run(userId, productId, quantity, new Date().toISOString());
  },

  /** Adds to the existing quantity rather than replacing it. */
  addQuantity(userId: string, productId: string, delta: number): number {
    const row = db
      .prepare('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
      .get(userId, productId) as Row | undefined;

    const next = num(row?.quantity) + delta;
    carts.setQuantity(userId, productId, next);
    return Math.max(next, 0);
  },

  remove(userId: string, productId: string): void {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
      userId,
      productId
    );
  },

  clearStore(userId: string, storeId: string): void {
    db.prepare(
      `DELETE FROM cart_items
       WHERE user_id = ?
         AND product_id IN (SELECT id FROM products WHERE store_id = ?)`
    ).run(userId, storeId);
  },

  clear(userId: string): void {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  },
};

function toOrderItem(row: Row): OrderItem {
  return {
    productId: str(row.product_id),
    name: str(row.name),
    imageUrl: str(row.image_url),
    weightOrUnit: str(row.weight_or_unit),
    unitPrice: num(row.unit_price),
    quantity: num(row.quantity),
  };
}

export const orders = {
  /** Loads orders plus their items, avoiding an N+1 query per order. */
  hydrate(rows: Row[]): Order[] {
    if (rows.length === 0) return [];

    const ids = rows.map((row) => str(row.id));
    const placeholders = ids.map(() => '?').join(', ');
    const itemRows = db
      .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`)
      .all(...ids) as Row[];

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const itemRow of itemRows) {
      const orderId = str(itemRow.order_id);
      const bucket = itemsByOrder.get(orderId);
      if (bucket) bucket.push(toOrderItem(itemRow));
      else itemsByOrder.set(orderId, [toOrderItem(itemRow)]);
    }

    return rows.map((row) => ({
      id: str(row.id),
      storeId: str(row.store_id),
      storeName: str(row.store_name),
      storeImageUrl: str(row.store_image_url),
      status: str(row.status) as Order['status'],
      subtotal: num(row.subtotal),
      deliveryFee: num(row.delivery_fee),
      serviceFee: num(row.service_fee),
      discount: num(row.discount),
      total: num(row.total),
      deliveryAddress: str(row.delivery_address),
      placedAt: str(row.placed_at),
      updatedAt: str(row.updated_at),
      items: itemsByOrder.get(str(row.id)) ?? [],
    }));
  },

  listFor(userId: string, limit = 50): Order[] {
    const sql = `
      SELECT o.*, s.name AS store_name, s.image_url AS store_image_url
      FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE o.user_id = ?
      ORDER BY o.placed_at DESC
      LIMIT ?
    `;
    return orders.hydrate(db.prepare(sql).all(userId, limit) as Row[]);
  },

  byId(userId: string, orderId: string): Order | null {
    const sql = `
      SELECT o.*, s.name AS store_name, s.image_url AS store_image_url
      FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE o.user_id = ? AND o.id = ?
    `;
    const row = db.prepare(sql).get(userId, orderId) as Row | undefined;
    return row ? (orders.hydrate([row])[0] ?? null) : null;
  },

  /** Product ids the user has ordered before, most recent first. */
  previouslyOrderedProductIds(userId: string, limit = 20): string[] {
    const sql = `
      SELECT oi.product_id, MAX(o.placed_at) AS last_ordered
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY oi.product_id
      ORDER BY last_ordered DESC
      LIMIT ?
    `;
    return (db.prepare(sql).all(userId, limit) as Row[]).map((row) => str(row.product_id));
  },
};

/** Money is stored as REAL; round on the way out so totals never show 1/3 cents. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;
