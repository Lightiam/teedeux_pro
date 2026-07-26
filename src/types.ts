export type ScreenId =
  | 'splash'
  | 'onboarding-discover'
  | 'onboarding-schedule'
  | 'location'
  | 'login'
  | 'signup'
  | 'reset-password'
  | 'home'
  | 'stores'
  | 'store-detail'
  | 'buy-it-again'
  | 'cart'
  | 'order-tracking'
  | 'transactions'
  | 'profile'
  | 'payment';

/** A cart scoped to a single fulfilment hub, the way Instacart keeps one cart per retailer. */
export interface StoreCart {
  store: Store;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

/** A browsable aisle within a store, used by the department grid and store detail tabs. */
export interface Aisle {
  id: ProductCategory;
  label: string;
  icon: string;
  /** Tailwind background colour for the aisle bubble. */
  tint: string;
}

export type ProductCategory =
  | 'spices'
  | 'grains'
  | 'produce'
  | 'seafood'
  | 'meat'
  | 'snacks';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  currency: string;
  weightOrUnit: string;
  imageUrl: string;
  isNewArrival?: boolean;
  storeId: string;
  storeName: string;
  description?: string;
}

export interface Store {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  tagline: string;
  imageUrl: string;
  isFeatured?: boolean;
  categoryTags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  storeName: string;
  storeImageUrl: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Refunded';
  itemSummary?: string;
  itemsSummary?: string;
  itemCount?: number;
  paymentMethod?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isPlusMember: boolean;
  walletBalance: number;
  loyaltyPoints: number;
  defaultAddress: string;
  isVerified?: boolean;
  membershipTier?: string;
  creditBalance?: number;
  points?: number;
}
