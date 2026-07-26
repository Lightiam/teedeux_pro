import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, ProductCategory, Store } from '../shared/types';
import { mockAisles, mockProducts, mockStores } from '../shared/mockData';
import { useCartContext } from '../CartContext';
import { ProductTile } from '../components/ProductTile';
import { RetailerCard } from '../components/RetailerCard';
import { colors, radius } from '../theme';
import type { RootStackParamList, TabParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GUTTER = 16;
const COLUMN_GAP = 12;

export const BrowseScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TabParamList, 'Browse'>>();
  const cart = useCartContext();
  const { width } = useWindowDimensions();

  const [tab, setTab] = useState<'products' | 'hubs'>('products');
  const [aisle, setAisle] = useState<ProductCategory | 'all'>('all');

  // Home's aisle grid navigates here with a department pre-selected.
  useEffect(() => {
    if (route.params?.aisle) {
      setAisle(route.params.aisle);
      setTab('products');
    }
  }, [route.params?.aisle]);

  const tileWidth = (width - GUTTER * 2 - COLUMN_GAP) / 2;

  const filtered =
    aisle === 'all' ? mockProducts : mockProducts.filter((p) => p.category === aisle);

  const openStore = (store: Store) => navigation.navigate('StoreDetail', { storeId: store.id });
  const openProduct = (product: Product) =>
    navigation.navigate('ProductDetail', { productId: product.id });

  const chips: Array<{ id: ProductCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    ...mockAisles.map((a) => ({ id: a.id, label: a.label })),
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.toggleWrap}>
        <View style={styles.toggle}>
          {(['products', 'hubs'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setTab(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === value }}
              style={[styles.toggleButton, tab === value && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, tab === value && styles.toggleTextActive]}>
                {value === 'products'
                  ? `Items (${mockProducts.length})`
                  : `Hubs (${mockStores.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'products' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            style={styles.chipScroller}
          >
            {chips.map((chip) => {
              const isActive = aisle === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => setAisle(chip.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            data={filtered}
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
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nothing in this aisle yet</Text>
                <Pressable onPress={() => setAisle('all')} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>Show all items</Text>
                </Pressable>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={mockStores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.hubList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RetailerCard store={item} layout="row" onSelect={openStore} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  toggleWrap: { paddingHorizontal: GUTTER, paddingTop: 12 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  toggleButtonActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  toggleTextActive: { color: colors.primary },

  chipScroller: { flexGrow: 0 },
  chipRow: { paddingHorizontal: GUTTER, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  chipTextActive: { color: '#fff' },

  grid: { paddingHorizontal: GUTTER, paddingBottom: 24 },
  column: { gap: COLUMN_GAP, marginBottom: 20 },

  hubList: { padding: GUTTER, gap: 10 },

  empty: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
