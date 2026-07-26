import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { useCartContext } from '../CartContext';
import { HomeScreen } from '../screens/HomeScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { BuyAgainScreen } from '../screens/BuyAgainScreen';
import { CartsScreen } from '../screens/CartsScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { StoreDetailScreen } from '../screens/StoreDetailScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Browse: 'search',
  BuyAgain: 'replay',
  Carts: 'shopping-cart',
  Account: 'person',
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Home: 'Home',
  Browse: 'Browse',
  BuyAgain: 'Buy again',
  Carts: 'Carts',
  Account: 'Account',
};

const TabNavigator: React.FC = () => {
  const cart = useCartContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: '800', color: colors.onSurface },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Teedeux Mart' }} />
      <Tab.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse' }} />
      <Tab.Screen
        name="BuyAgain"
        component={BuyAgainScreen}
        options={{ title: 'Buy it again' }}
      />
      <Tab.Screen
        name="Carts"
        component={CartsScreen}
        options={{
          title: 'Your carts',
          // Badge omitted when empty so the tab isn't decorated with a zero.
          tabBarBadge: cart.totalCount > 0 ? cart.totalCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger },
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { fontWeight: '800', color: colors.onSurface },
      headerTintColor: colors.primary,
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
    {/* The screen sets its own title once the catalog resolves the hub. */}
    <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{ title: 'Hub' }} />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: 'Product' }}
    />
  </Stack.Navigator>
);
