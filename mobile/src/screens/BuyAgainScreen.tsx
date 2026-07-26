import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product } from '../shared/types';
import { useCatalog } from '../CatalogContext';
import { useCartContext } from '../CartContext';
import { ProductTile } from '../components/ProductTile';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GUTTER = 16;
const COLUMN_GAP = 12;

export const BuyAgainScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const cart = useCartContext();
  const { buyItAgain } = useCatalog();
  const { width } = useWindowDimensions();
  const tileWidth = (width - GUTTER * 2 - COLUMN_GAP) / 2;

  const openProduct = (product: Product) =>
    navigation.navigate('ProductDetail', { productId: product.id });

  if (buyItAgain.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No past orders yet</Text>
        <Text style={styles.emptyBody}>
          Items you order will show up here for one-tap reordering.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.caption}>
          {buyItAgain.length} items from your order history
        </Text>
        <Pressable
          onPress={() => buyItAgain.forEach(cart.addItem)}
          accessibilityRole="button"
          style={styles.addAll}
        >
          <Text style={styles.addAllText}>Add all to cart</Text>
        </Pressable>
      </View>

      <FlatList
        data={buyItAgain}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            width={tileWidth}
            quantity={cart.quantityOf(item.id)}
            onIncrement={cart.addItem}
            onDecrement={cart.decrementItem}
            onOpen={openProduct}
            showStoreName
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
  },
  caption: { fontSize: 12, color: colors.onSurfaceVariant, flex: 1 },
  addAll: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addAllText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  grid: { paddingHorizontal: GUTTER, paddingBottom: 24 },
  column: { gap: COLUMN_GAP, marginBottom: 20 },

  empty: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.onSurface },
  emptyBody: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
});
