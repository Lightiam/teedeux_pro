import type { DocumentData, DocumentSnapshot, Query } from 'firebase-admin/firestore';
import { COLLECTIONS } from './config.js';
import { db, round2 } from './firestore.js';
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
} from './types.js';

type Snap = DocumentSnapshot<DocumentData>;

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback;
const bool = (value: unknown): boolean => value === true;
const nullableStr = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;
const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

export function toStore(snap: Snap): Store {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    name: str(data.name),
    rating: num(data.rating),
    deliveryTime: str(data.deliveryTime),
    deliveryFee: str(data.deliveryFee),
    minOrder: str(data.minOrder),
    tagline: str(data.tagline),
    imageUrl: str(data.imageUrl),
    isFeatured: bool(data.isFeatured),
    categoryTags: strArray(data.categoryTags),
  };
}

export function toProduct(snap: Snap): Product {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    name: str(data.name),
    category: str(data.category) as ProductCategory,
    price: num(data.price),
    currency: str(data.currency, '$'),
    weightOrUnit: str(data.weightOrUnit),
    imageUrl: str(data.imageUrl),
    isNewArrival: bool(data.isNewArrival),
    storeId: str(data.storeId),
    storeName: str(data.storeName),
    description: nullableStr(data.description),
  };
}

export function toPublicUser(snap: Snap): PublicUser {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    name: str(data.name),
    email: str(data.email),
    phone: nullableStr(data.phone),
    avatarUrl: nullableStr(data.avatarUrl),
    isPlusMember: bool(data.isPlusMember),
    walletBalance: num(data.walletBalance),
    loyaltyPoints: num(data.loyaltyPoints),
    defaultAddress: nullableStr(data.defaultAddress),
  };
}

export const stores = {
  async all(): Promise<Store[]> {
    const snap = await db.collection(COLLECTIONS.stores).orderBy('name').get();
    const list = snap.docs.map(toStore);
    // Featured hubs lead. Sorted here rather than in Firestore so the query
    // needs no composite index for a collection this small.
    return list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  },

  async byId(id: string): Promise<Store | null> {
    const snap = await db.collection(COLLECTIONS.stores).doc(id).get();
    return snap.exists ? toStore(snap) : null;
  },

  /** Batched lookup, used when grouping a cart or hydrating orders. */
  async byIds(ids: string[]): Promise<Map<string, Store>> {
    const unique = Array.from(new Set(ids));
    if (unique.length === 0) return new Map();

    const refs = unique.map((id) => db.collection(COLLECTIONS.stores).doc(id));
    const snaps = await db.getAll(...refs);

    const result = new Map<string, Store>();
    for (const snap of snaps) {
      if (snap.exists) result.set(snap.id, toStore(snap));
    }
    return result;
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
  /**
   * Firestore cannot express "LIKE %term%", so a search term is matched
   * against the derived `searchTokens` array. Whole words hit; mid-word
   * substrings do not. Paging uses offset(), which Firestore bills for as
   * skipped reads — acceptable at this catalog size, not at scale.
   */
  async query({
    storeId,
    category,
    search,
    limit = 100,
    offset = 0,
  }: ProductQuery): Promise<Product[]> {
    let query: Query<DocumentData> = db.collection(COLLECTIONS.products);

    if (storeId) query = query.where('storeId', '==', storeId);
    if (category) query = query.where('category', '==', category);

    if (search) {
      const terms = search
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 3)
        // array-contains-any accepts at most 30 values.
        .slice(0, 30);

      // A search made entirely of short fragments matches nothing rather than
      // silently returning the whole catalog.
      if (terms.length === 0) return [];
      query = query.where('searchTokens', 'array-contains-any', terms);
    }

    const snap = await query.orderBy('name').offset(offset).limit(limit).get();
    return snap.docs.map(toProduct);
  },

  async count(query: ProductQuery): Promise<number> {
    let ref: Query<DocumentData> = db.collection(COLLECTIONS.products);

    if (query.storeId) ref = ref.where('storeId', '==', query.storeId);
    if (query.category) ref = ref.where('category', '==', query.category);

    if (query.search) {
      const terms = query.search
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 3)
        .slice(0, 30);
      if (terms.length === 0) return 0;
      ref = ref.where('searchTokens', 'array-contains-any', terms);
    }

    // Aggregation query: billed as one read per 1000 matched documents rather
    // than one per document.
    const snap = await ref.count().get();
    return snap.data().count;
  },

  async byId(id: string): Promise<Product | null> {
    const snap = await db.collection(COLLECTIONS.products).doc(id).get();
    return snap.exists ? toProduct(snap) : null;
  },

  async byIds(ids: string[]): Promise<Map<string, Product>> {
    const unique = Array.from(new Set(ids));
    if (unique.length === 0) return new Map();

    const refs = unique.map((id) => db.collection(COLLECTIONS.products).doc(id));
    const snaps = await db.getAll(...refs);

    const result = new Map<string, Product>();
    for (const snap of snaps) {
      if (snap.exists) result.set(snap.id, toProduct(snap));
    }
    return result;
  },
};

export const aisles = {
  async all(): Promise<Aisle[]> {
    const snap = await db.collection(COLLECTIONS.aisles).orderBy('position').get();
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id as ProductCategory,
        label: str(data.label),
        icon: str(data.icon),
        tint: str(data.tint),
      };
    });
  },
};

export const users = {
  async publicById(uid: string): Promise<PublicUser | null> {
    const snap = await db.collection(COLLECTIONS.users).doc(uid).get();
    return snap.exists ? toPublicUser(snap) : null;
  },
};

export const carts = {
  /** Cart lines joined to their live product. */
  async itemsFor(uid: string): Promise<CartItem[]> {
    const snap = await db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .collection(COLLECTIONS.cart)
      .get();

    if (snap.empty) return [];

    const productMap = await products.byIds(snap.docs.map((doc) => doc.id));

    const items: CartItem[] = [];
    for (const doc of snap.docs) {
      const product = productMap.get(doc.id);
      // A product removed from the catalog leaves an orphan line; skip it
      // rather than surfacing a half-populated row.
      if (!product) continue;
      items.push({ product, quantity: num(doc.data().quantity) });
    }

    return items.sort((a, b) => a.product.name.localeCompare(b.product.name));
  },

  /** Groups the flat cart into one cart per fulfilment hub. */
  async groupedFor(uid: string): Promise<StoreCart[]> {
    const items = await carts.itemsFor(uid);
    if (items.length === 0) return [];

    const storeMap = await stores.byIds(items.map((item) => item.product.storeId));
    const byStore = new Map<string, CartItem[]>();

    for (const item of items) {
      const bucket = byStore.get(item.product.storeId);
      if (bucket) bucket.push(item);
      else byStore.set(item.product.storeId, [item]);
    }

    const result: StoreCart[] = [];
    for (const [storeId, storeItems] of byStore) {
      const store = storeMap.get(storeId);
      if (!store) continue;

      result.push({
        store,
        items: storeItems,
        itemCount: storeItems.reduce((sum, i) => sum + i.quantity, 0),
        subtotal: round2(storeItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)),
      });
    }

    return result.sort((a, b) => a.store.name.localeCompare(b.store.name));
  },

  lineRef(uid: string, productId: string) {
    return db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .collection(COLLECTIONS.cart)
      .doc(productId);
  },

  async setQuantity(uid: string, productId: string, quantity: number): Promise<void> {
    const ref = carts.lineRef(uid, productId);
    if (quantity <= 0) {
      await ref.delete();
      return;
    }
    await ref.set({ quantity, updatedAt: new Date().toISOString() });
  },

  /** Adds to the existing quantity rather than replacing it. */
  async addQuantity(uid: string, productId: string, delta: number): Promise<void> {
    const ref = carts.lineRef(uid, productId);

    // A transaction keeps two concurrent "+1" taps from collapsing into one.
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const next = num(snap.data()?.quantity) + delta;

      if (next <= 0) tx.delete(ref);
      else tx.set(ref, { quantity: next, updatedAt: new Date().toISOString() });
    });
  },

  async remove(uid: string, productId: string): Promise<void> {
    await carts.lineRef(uid, productId).delete();
  },

  async clearStore(uid: string, storeId: string): Promise<void> {
    const items = await carts.itemsFor(uid);
    const doomed = items.filter((item) => item.product.storeId === storeId);
    if (doomed.length === 0) return;

    const batch = db.batch();
    for (const item of doomed) batch.delete(carts.lineRef(uid, item.product.id));
    await batch.commit();
  },

  async clear(uid: string): Promise<void> {
    const snap = await db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .collection(COLLECTIONS.cart)
      .get();
    if (snap.empty) return;

    const batch = db.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
  },
};

function toOrder(snap: Snap): Order {
  const data = snap.data() ?? {};
  const rawItems = Array.isArray(data.items) ? data.items : [];

  return {
    id: snap.id,
    storeId: str(data.storeId),
    storeName: str(data.storeName),
    storeImageUrl: str(data.storeImageUrl),
    status: str(data.status) as Order['status'],
    subtotal: num(data.subtotal),
    deliveryFee: num(data.deliveryFee),
    serviceFee: num(data.serviceFee),
    discount: num(data.discount),
    total: num(data.total),
    deliveryAddress: str(data.deliveryAddress),
    placedAt: str(data.placedAt),
    updatedAt: str(data.updatedAt),
    items: rawItems.map(
      (item: Record<string, unknown>): OrderItem => ({
        productId: str(item.productId),
        name: str(item.name),
        imageUrl: str(item.imageUrl),
        weightOrUnit: str(item.weightOrUnit),
        unitPrice: num(item.unitPrice),
        quantity: num(item.quantity),
      })
    ),
  };
}

export const orders = {
  /**
   * Order items are stored on the order document rather than a subcollection.
   * An order is always read whole and never grows unbounded, so embedding
   * turns what would be N+1 reads into one.
   */
  async listFor(uid: string, limit = 50): Promise<Order[]> {
    const snap = await db
      .collection(COLLECTIONS.orders)
      .where('userId', '==', uid)
      .orderBy('placedAt', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(toOrder);
  },

  /**
   * Scoped by userId in the query itself, so another user's order is simply
   * not found rather than found-and-refused.
   */
  async byId(uid: string, orderId: string): Promise<Order | null> {
    const snap = await db.collection(COLLECTIONS.orders).doc(orderId).get();
    if (!snap.exists) return null;
    if (str(snap.data()?.userId) !== uid) return null;
    return toOrder(snap);
  },

  /** Product ids the user has ordered before, most recent first. */
  async previouslyOrderedProductIds(uid: string, limit = 20): Promise<string[]> {
    const snap = await db
      .collection(COLLECTIONS.orders)
      .where('userId', '==', uid)
      .orderBy('placedAt', 'desc')
      .limit(50)
      .get();

    const seen: string[] = [];
    for (const doc of snap.docs) {
      const items = Array.isArray(doc.data().items) ? doc.data().items : [];
      for (const item of items) {
        const productId = str((item as Record<string, unknown>).productId);
        if (productId && !seen.includes(productId)) seen.push(productId);
        if (seen.length >= limit) return seen;
      }
    }
    return seen;
  },
};
