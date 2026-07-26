import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProductCategory } from '../shared/types';

export type TabParamList = {
  Home: undefined;
  Browse: { aisle?: ProductCategory } | undefined;
  BuyAgain: undefined;
  Carts: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  StoreDetail: { storeId: string };
  ProductDetail: { productId: string };
};
