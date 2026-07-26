export type ProductCategory =
  | 'spices'
  | 'grains'
  | 'produce'
  | 'seafood'
  | 'meat'
  | 'snacks';

export type OrderStatus =
  | 'placed'
  | 'shopping'
  | 'packed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

/** Ordered lifecycle. Index position is used to decide legal transitions. */
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

/** A cart scoped to one fulfilment hub — each hub ships independently. */
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
  /** Price captured when the order was placed, not the live catalog price. */
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
