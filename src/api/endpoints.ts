import { api } from './client';
import type {
  Aisle,
  ApiCart,
  ApiOrder,
  ApiOrderStatus,
  ApiUser,
  AuthResult,
  Product,
  ProductQuery,
  Store,
} from './types';

export const authApi = {
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResult>('/auth/signup', body, { anonymous: true }),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResult>('/auth/login', body, { anonymous: true }),

  resetPassword: (body: { email: string; newPassword: string }) =>
    api.post<{ ok: boolean; message: string }>('/auth/reset-password', body, { anonymous: true }),

  me: () => api.get<{ user: ApiUser }>('/auth/me'),
};

/**
 * Endpoints that only exist on the Firebase backend.
 *
 * Sign-in and password reset are handled by the Firebase SDK on the client, so
 * there is no /auth/login here. Signup still goes through the server, which
 * creates the Auth record and the profile document together.
 */
export const firebaseAuthApi = {
  signup: (body: { name: string; email: string; password: string; phone?: string }) =>
    api.post<{ user: ApiUser }>('/auth/signup', body, { anonymous: true }),

  /** Backfills a profile for accounts created outside this API. */
  ensureProfile: () => api.post<{ user: ApiUser }>('/auth/ensure-profile'),
};

export const catalogApi = {
  stores: () => api.get<{ stores: Store[] }>('/catalog/stores'),

  store: (storeId: string) =>
    api.get<{ store: Store; products: Product[] }>(`/catalog/stores/${storeId}`),

  aisles: () => api.get<{ aisles: Aisle[] }>('/catalog/aisles'),

  products: (query: ProductQuery = {}) =>
    api.get<{ products: Product[]; total: number; limit: number; offset: number }>(
      '/catalog/products',
      { query: { ...query } }
    ),

  product: (productId: string) => api.get<{ product: Product }>(`/catalog/products/${productId}`),

  buyItAgain: () => api.get<{ products: Product[] }>('/catalog/buy-it-again'),
};

export const cartApi = {
  get: (promoCode?: string) => api.get<ApiCart>('/cart', { query: { promoCode } }),

  /** Adds to whatever quantity is already in the cart. */
  addItem: (productId: string, quantity = 1) =>
    api.post<ApiCart>('/cart/items', { productId, quantity }),

  /** Sets an absolute quantity; 0 removes the line. */
  setQuantity: (productId: string, quantity: number) =>
    api.patch<ApiCart>(`/cart/items/${productId}`, { quantity }),

  removeItem: (productId: string) => api.delete<ApiCart>(`/cart/items/${productId}`),

  clearStore: (storeId: string) => api.delete<ApiCart>(`/cart/stores/${storeId}`),

  clear: () => api.delete<ApiCart>('/cart'),
};

export const orderApi = {
  list: () => api.get<{ orders: ApiOrder[] }>('/orders'),

  get: (orderId: string) => api.get<{ order: ApiOrder }>(`/orders/${orderId}`),

  checkout: (body: { storeId?: string; deliveryAddress?: string; promoCode?: string }) =>
    api.post<{ orders: ApiOrder[]; grandTotal: number }>('/orders/checkout', body),

  setStatus: (orderId: string, status: ApiOrderStatus) =>
    api.post<{ order: ApiOrder }>(`/orders/${orderId}/status`, { status }),
};

export const profileApi = {
  get: () => api.get<{ user: ApiUser }>('/profile'),

  update: (body: {
    name?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    defaultAddress?: string | null;
  }) => api.patch<{ user: ApiUser }>('/profile', body),

  topUpWallet: (amount: number) =>
    api.post<{ user: ApiUser }>('/profile/wallet/top-up', { amount }),
};
