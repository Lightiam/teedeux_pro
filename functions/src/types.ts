export type ProductCategory =
  | 'spices'
  | 'grains'
  | 'produce'
  | 'seafood'
  | 'meat'
  | 'snacks';

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  'spices',
  'grains',
  'produce',
  'seafood',
  'meat',
  'snacks',
] as const;

export type OrderStatus =
  | 'placed'
  | 'shopping'
  | 'packed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

/** Ordered lifecycle. Index position decides which transitions are legal. */
export const ORDER_FLOW: readonly OrderStatus[] = [
  'placed',
  'shopping',
  'packed',
  'in_transit',
  'delivered',
] as const;

export interface Store {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  tagline: string;
  imageUrl: string;
  isFeatured: boolean;
  categoryTags: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  currency: string;
  weightOrUnit: string;
  imageUrl: string;
  isNewArrival: boolean;
  storeId: string;
  storeName: string;
  description: string | null;
}

/**
 * Product as stored. `searchTokens` is derived on write — Firestore has no
 * LIKE operator, so text search is served by array-contains-any over this.
 */
export interface ProductDoc extends Omit<Product, 'id'> {
  searchTokens: string[];
}

export interface Aisle {
  id: ProductCategory;
  label: string;
  icon: string;
  tint: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/** A cart scoped to one fulfilment hub — hubs ship independently. */
export interface StoreCart {
  store: Store;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  isPlusMember: boolean;
  walletBalance: number;
  loyaltyPoints: number;
  defaultAddress: string | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  weightOrUnit: string;
  /** Price captured at checkout, not the live catalog price. */
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  storeImageUrl: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
}
