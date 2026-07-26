import { api } from './client';
import type {
  Aisle,
  ApiCart,
  ApiOrder,
  ApiOrderStatus,
  ApiUser,
  AuthResult,
  Product,
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

export const catalogApi = {
  stores: () => api.get<{ stores: Store[] }>('/catalog/stores'),
  aisles: () => api.get<{ aisles: Aisle[] }>('/catalog/aisles'),
  products: (query: { limit?: number; storeId?: string; category?: string } = {}) =>
    api.get<{ products: Product[]; total: number }>('/catalog/products', { query: { ...query } }),
  buyItAgain: () => api.get<{ products: Product[] }>('/catalog/buy-it-again'),
};

export const cartApi = {
  get: (promoCode?: string) => api.get<ApiCart>('/cart', { query: { promoCode } }),
  addItem: (productId: string, quantity = 1) =>
    api.post<ApiCart>('/cart/items', { productId, quantity }),
  setQuantity: (productId: string, quantity: number) =>
    api.patch<ApiCart>(`/cart/items/${productId}`, { quantity }),
  clearStore: (storeId: string) => api.delete<ApiCart>(`/cart/stores/${storeId}`),
};

export const orderApi = {
  list: () => api.get<{ orders: ApiOrder[] }>('/orders'),
  checkout: (body: { deliveryAddress?: string; promoCode?: string }) =>
    api.post<{ orders: ApiOrder[]; grandTotal: number }>('/orders/checkout', body),
  setStatus: (orderId: string, status: ApiOrderStatus) =>
    api.post<{ order: ApiOrder }>(`/orders/${orderId}/status`, { status }),
};

export const profileApi = {
  get: () => api.get<{ user: ApiUser }>('/profile'),
  topUpWallet: (amount: number) => api.post<{ user: ApiUser }>('/profile/wallet/top-up', { amount }),
};
