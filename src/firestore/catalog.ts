import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from './client';
import type { Aisle, Product, ProductCategory, Store } from '../types';

type Snap = QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>;

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback;
const bool = (value: unknown): boolean => value === true;
const strArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

function toStore(snap: Snap): Store {
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

function toProduct(snap: Snap): Product {
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
    description: typeof data.description === 'string' ? data.description : undefined,
  };
}

/**
 * Catalog read straight from Firestore.
 *
 * The published rules make stores, products and aisles world-readable, so this
 * path works with no Cloud Functions deployed. The catalog is small enough to
 * fetch whole — paging it per screen would cost more round trips than payload.
 */
export const firestoreCatalog = {
  async stores(): Promise<Store[]> {
    const snap = await getDocs(query(collection(firestore(), 'stores'), orderBy('name')));
    // Featured hubs lead. Sorted here so the query needs no composite index.
    return snap.docs.map(toStore).sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  },

  async products(): Promise<Product[]> {
    const snap = await getDocs(query(collection(firestore(), 'products'), orderBy('name')));
    return snap.docs.map(toProduct);
  },

  async aisles(): Promise<Aisle[]> {
    const snap = await getDocs(query(collection(firestore(), 'aisles'), orderBy('position')));
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id as ProductCategory,
        label: str(data.label),
        icon: str(data.icon),
        tint: str(data.tint),
      };
    });
  },

  async product(productId: string): Promise<Product | null> {
    const snap = await getDoc(doc(firestore(), 'products', productId));
    return snap.exists() ? toProduct(snap) : null;
  },
};
