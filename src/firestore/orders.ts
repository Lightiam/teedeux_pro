import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './client';
import type { ApiOrder, ApiOrderItem, ApiStoreCart } from '../api/types';
import type { Product, Store } from '../types';

/** What a client is permitted to write. Deliberately free of prices. */
interface OrderRequestItem {
  productId: string;
  quantity: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

export const firestoreOrders = {
  /**
   * Places one order per fulfilment hub, since hubs ship independently.
   *
   * The documents carry item ids and quantities only — no prices, no total.
   * Firestore rules cannot sum a list, so a client-supplied total could never
   * be verified against real prices; the only safe answer is not to store one.
   * The server prices the order afterwards, which is also how grocery delivery
   * genuinely works: weights and substitutions move the final figure.
   *
   * The batch makes the whole checkout atomic — either every hub's order is
   * placed and its cart lines cleared, or none are.
   */
  async placeOrders(
    uid: string,
    carts: ApiStoreCart[],
    deliveryAddress: string | null
  ): Promise<string[]> {
    const db = firestore();
    const batch = writeBatch(db);
    const placedAt = new Date().toISOString();
    const orderIds: string[] = [];

    for (const cart of carts) {
      const orderRef = doc(collection(db, 'orders'));

      const items: OrderRequestItem[] = cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      batch.set(orderRef, {
        userId: uid,
        storeId: cart.store.id,
        status: 'placed',
        placedAt,
        // Omitted entirely rather than written as null: the rules whitelist
        // permits this key but `null` would read as a real, empty address.
        ...(deliveryAddress ? { deliveryAddress } : {}),
        items,
      });

      // Clearing the cart in the same batch keeps checkout all-or-nothing.
      for (const item of cart.items) {
        batch.delete(doc(db, 'users', uid, 'cart', item.product.id));
      }

      orderIds.push(orderRef.id);
    }

    await batch.commit();
    return orderIds;
  },

  /**
   * Reads the shopper's orders and rebuilds display detail from the catalog.
   *
   * Prices come from the catalog, never from the order document, because a
   * client wrote that document. Once a server prices an order it can write the
   * real figures and those take precedence.
   */
  async list(uid: string, products: Product[], stores: Store[]): Promise<ApiOrder[]> {
    const snap = await getDocs(
      query(
        collection(firestore(), 'orders'),
        where('userId', '==', uid),
        orderBy('placedAt', 'desc')
      )
    );

    const productById = new Map(products.map((product) => [product.id, product]));
    const storeById = new Map(stores.map((store) => [store.id, store]));

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const store = storeById.get(String(data.storeId));
      const rawItems: unknown[] = Array.isArray(data.items) ? data.items : [];

      const items: ApiOrderItem[] = rawItems.map((raw) => {
        const entry = raw as Record<string, unknown>;
        const productId = String(entry.productId ?? '');
        const quantity = typeof entry.quantity === 'number' ? entry.quantity : 1;
        const product = productById.get(productId);

        return {
          productId,
          name: product?.name ?? 'Item no longer in the catalog',
          imageUrl: product?.imageUrl ?? '',
          weightOrUnit: product?.weightOrUnit ?? '',
          // Server-written price wins; otherwise resolved from the live
          // catalog, which is why this is an estimate rather than a receipt.
          unitPrice:
            typeof entry.unitPrice === 'number' ? entry.unitPrice : (product?.price ?? 0),
          quantity,
        };
      });

      const subtotal = round2(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
      const serverTotal = typeof data.total === 'number' ? data.total : null;

      return {
        id: docSnap.id,
        storeId: String(data.storeId ?? ''),
        storeName: store?.name ?? 'Fulfilment hub',
        storeImageUrl: store?.imageUrl ?? '',
        status: String(data.status ?? 'placed') as ApiOrder['status'],
        subtotal,
        deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee : 0,
        serviceFee: typeof data.serviceFee === 'number' ? data.serviceFee : 0,
        discount: typeof data.discount === 'number' ? data.discount : 0,
        total: serverTotal ?? subtotal,
        deliveryAddress: String(data.deliveryAddress ?? 'No address on file'),
        placedAt: String(data.placedAt ?? ''),
        updatedAt: String(data.updatedAt ?? data.placedAt ?? ''),
        items,
      };
    });
  },
};

/** True when no server has priced this order, so its total is an estimate. */
export const isPendingPricing = (order: ApiOrder): boolean =>
  order.deliveryFee === 0 && order.serviceFee === 0 && order.discount === 0;
