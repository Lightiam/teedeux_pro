import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, ProductCategory } from '../shared/types';
import { useCatalog } from '../CatalogContext';
import { useCartContext } from '../CartContext';
import { ProductTile } from '../components/ProductTile';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GUTTER = 16;
const COLUMN_GAP = 12;

export const StoreDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'StoreDetail'>>();
  const cart = useCartContext();
  const { stores, products, aisles } = useCatalog();
  const { width } = useWindowDimensions();

  const [aisle, setAisle] = useState<ProductCategory | 'all'>('all');

  const store = stores.find((s) => s.id === route.params.storeId);

  // The navigator can't read the catalog, so the title is set from here once
  // the hub resolves.
  useEffect(() => {
    if (store) navigation.setOptions({ title: store.name });
  }, [navigation, store]);

  const storeProducts = useMemo(
    () => (store ? products.filter((p) => p.storeId === store.id) : []),
    [products, store]
  );

  /** Only offer aisles this hub actually stocks — empty tabs are dead ends. */
  const availableAisles = useMemo(() => {
    const stocked = new Set(storeProducts.map((p) => p.category));
    return aisles.filter((a) => stocked.has(a.id));
  }, [aisles, storeProducts]);

  const visible =
    aisle === 'all' ? storeProducts : storeProducts.filter((p) => p.category === aisle);

  const tileWidth = (width - GUTTER * 2 - COLUMN_GAP) / 2;

  const openProduct = (product: Product) =>
    navigation.navigate('ProductDetail', { productId: product.id });

  // The catalog may still be loading, or the hub may have been removed.
  if (!store) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={visible}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <View style={styles.hero}>
            <Image source={{ uri: store.imageUrl }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroText}>
              <View style={styles.heroTitleLine}>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  {store.name}
                </Text>
                {store.isFeatured && <MaterialIcons name="verified" size={18} color="#fff" />}
              </View>
              <View style={styles.heroMeta}>
                <MaterialIcons name="star" size={12} color="#fff" />
                <Text style={styles.heroMetaText}>{store.rating}</Text>
                <Text style={styles.heroMetaText}>•</Text>
                <Text style={styles.heroMetaText}>{store.deliveryFee}</Text>
                <Text style={styles.heroMetaText}>•</Text>
                <Text style={styles.heroMetaText}>{store.minOrder}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.tagline}>{store.tagline}</Text>

          {availableAisles.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <Chip
                label={`All (${storeProducts.length})`}
                active={aisle === 'all'}
                onPress={() => setAisle('all')}
              />
              {availableAisles.map((a) => (
                <Chip
                  key={a.id}
                  label={a.label}
                  active={aisle === a.id}
                  onPress={() => setAisle(a.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <ProductTile
          product={item}
          width={tileWidth}
          quantity={cart.quantityOf(item.id)}
          onIncrement={cart.addItem}
          onDecrement={cart.decrementItem}
          onOpen={openProduct}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>This hub has no items listed yet</Text>
        </View>
      }
    />
  );
};

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  grid: { paddingHorizontal: GUTTER, paddingBottom: 32 },
  column: { gap: COLUMN_GAP, marginBottom: 20 },

  // Cancel the list's horizontal padding so the hero runs edge to edge.
  headerBlock: { marginHorizontal: -GUTTER, marginBottom: 16 },
  hero: { height: 160, backgroundColor: colors.surfaceHigh },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroText: { position: 'absolute', bottom: 12, left: GUTTER, right: GUTTER },
  heroTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', flexShrink: 1 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  heroMetaText: { fontSize: 10, color: 'rgba(255,255,255,0.9)' },

  tagline: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
  },

  chipRow: { paddingHorizontal: GUTTER, gap: 8, paddingBottom: 4 },
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

  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
});
