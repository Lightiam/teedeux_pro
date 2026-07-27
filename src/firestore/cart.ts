import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './client';
import type { ApiStoreCart } from '../api/types';
import type { Product, Store } from '../types';

const lineRef = (uid: string, productId: string) =>
  doc(firestore(), 'users', uid, 'cart', productId);

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Cart stored under users/{uid}/cart/{productId}.
 *
 * The published rules let a shopper write only their own cart, and only the
 * two fields below — a line carries a product id and a quantity, never a
 * price. Money is never read from here.
 */
export const firestoreCart = {
  /** Raw product-id to quantity map. */
  async quantities(uid: string): Promise<Map<string, number>> {
    const snap = await getDocs(collection(firestore(), 'users', uid, 'cart'));
    const map = new Map<string, number>();

    for (const docSnap of snap.docs) {
      const quantity = docSnap.data().quantity;
      if (typeof quantity === 'number' && quantity > 0) map.set(docSnap.id, quantity);
    }
    return map;
  },

  async setQuantity(uid: string, productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await deleteDoc(lineRef(uid, productId));
      return;
    }
    // Exactly the two fields the rules permit; anything else is rejected.
    await setDoc(lineRef(uid, productId), {
      quantity,
      updatedAt: new Date().toISOString(),
    });
  },

  async clearStore(uid: string, productIds: string[]): Promise<void> {
    if (productIds.length === 0) return;

    const batch = writeBatch(firestore());
    for (const productId of productIds) batch.delete(lineRef(uid, productId));
    await batch.commit();
  },
};

/**
 * Groups a flat quantity map into one cart per fulfilment hub, resolving each
 * line against the catalog already in memory rather than re-reading Firestore.
 */
export function groupCart(
  quantities: Map<string, number>,
  products: Product[],
  stores: Store[]
): ApiStoreCart[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const storeById = new Map(stores.map((store) => [store.id, store]));
  const byStore = new Map<string, { product: Product; quantity: number }[]>();

  for (const [productId, quantity] of quantities) {
    const product = productById.get(productId);
    // A line whose product left the catalog is skipped rather than shown blank.
    if (!product) continue;

    const bucket = byStore.get(product.storeId);
    if (bucket) bucket.push({ product, quantity });
    else byStore.set(product.storeId, [{ product, quantity }]);
  }

  const carts: ApiStoreCart[] = [];
  for (const [storeId, items] of byStore) {
    const store = storeById.get(storeId);
    if (!store) continue;

    carts.push({
      store,
      items: items.sort((a, b) => a.product.name.localeCompare(b.product.name)),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: round2(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)),
    });
  }

  return carts.sort((a, b) => a.store.name.localeCompare(b.store.name));
}
