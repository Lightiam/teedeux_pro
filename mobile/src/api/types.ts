import type { Aisle, Product, Store } from '../shared/types';

export interface ApiUser {
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

export interface ApiCartItem {
  product: Product;
  quantity: number;
}

export interface ApiStoreCart {
  store: Store;
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
}

export interface ApiTotals {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  amountToFreeDelivery: number;
}

export interface ApiCart {
  carts: ApiStoreCart[];
  itemCount: number;
  totals: ApiTotals;
  promoCode: string | null;
  promoValid: boolean | null;
}

export type ApiOrderStatus =
  | 'placed'
  | 'shopping'
  | 'packed'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface ApiOrderItem {
  productId: string;
  name: string;
  imageUrl: string;
  weightOrUnit: string;
  unitPrice: number;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  storeId: string;
  storeName: string;
  storeImageUrl: string;
  status: ApiOrderStatus;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  placedAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
}

export interface AuthResult {
  token: string;
  user: ApiUser;
}

export type { Aisle, Product, Store };
