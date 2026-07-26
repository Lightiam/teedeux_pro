import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, Store } from '../shared/types';
import { buyItAgainProducts, mockAisles, mockProducts, mockStores } from '../shared/mockData';
import { useCartContext } from '../CartContext';
import { ProductTile } from '../components/ProductTile';
import { RetailerCard } from '../components/RetailerCard';
import { SectionRail } from '../components/SectionRail';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const cart = useCartContext();

  const openStore = (store: Store) => navigation.navigate('StoreDetail', { storeId: store.id });
  const openProduct = (product: Product) =>
    navigation.navigate('ProductDetail', { productId: product.id });

  const newArrivals = mockProducts.filter((p) => p.isNewArrival).slice(0, 10);
  const underTwenty = mockProducts.filter((p) => p.price < 20).slice(0, 10);

  const tileProps = {
    onIncrement: cart.addItem,
    onDecrement: cart.decrementItem,
    onOpen: openProduct,
    layout: 'rail' as const,
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.promo}>
        <MaterialIcons name="local-shipping" size={26} color="#fff" />
        <View style={styles.promoText}>
          <Text style={styles.promoTitle}>Free delivery on $35+</Text>
          <Text style={styles.promoSub}>Nationwide 2-day express to all 50 states</Text>
        </View>
      </View>

      <SectionRail
        title="Shop by hub"
        subtitle="Verified African grocery fulfilment hubs"
        onSeeAll={() => navigation.navigate('Tabs', { screen: 'Browse' })}
      >
        {mockStores.map((store) => (
          <RetailerCard key={store.id} store={store} onSelect={openStore} />
        ))}
      </SectionRail>

      {buyItAgainProducts.length > 0 && (
        <SectionRail
          title="Buy it again"
          subtitle="Straight from your past orders"
          onSeeAll={() => navigation.navigate('Tabs', { screen: 'BuyAgain' })}
        >
          {buyItAgainProducts.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={cart.quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      <View style={styles.aisleSection}>
        <Text style={styles.sectionTitle}>Shop by aisle</Text>
        <Text style={styles.sectionSub}>Browse the full catalog by department</Text>

        <View style={styles.aisleGrid}>
          {mockAisles.map((aisle) => (
            <Pressable
              key={aisle.id}
              onPress={() =>
                navigation.navigate('Tabs', {
                  screen: 'Browse',
                  params: { aisle: aisle.id },
                })
              }
              accessibilityRole="button"
              style={({ pressed }) => [styles.aisle, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.aisleBubble, { backgroundColor: aisleTint(aisle.tint) }]}>
                <MaterialIcons
                  name={aisleIcon(aisle.id)}
                  size={26}
                  color={colors.onSurfaceVariant}
                />
              </View>
              <Text style={styles.aisleLabel}>{aisle.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {newArrivals.length > 0 && (
        <SectionRail title="New arrivals" subtitle="Just landed in the catalog">
          {newArrivals.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={cart.quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      {underTwenty.length > 0 && (
        <SectionRail
          title="Pantry staples under $20"
          subtitle="Everyday essentials, everyday prices"
        >
          {underTwenty.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={cart.quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      <View style={styles.hubSection}>
        <Text style={styles.sectionTitle}>All fulfilment hubs</Text>
        <View style={styles.hubList}>
          {mockStores.map((store) => (
            <RetailerCard key={store.id} store={store} layout="row" onSelect={openStore} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

/** The shared aisle data carries Tailwind classes; map them to raw hex for RN. */
function aisleTint(tailwindClass: string): string {
  const match = tailwindClass.match(/#[0-9a-f]{6}/i);
  return match ? match[0] : colors.surfaceHigh;
}

/** Material Symbols names in the shared data map to MaterialIcons equivalents. */
function aisleIcon(aisleId: string): React.ComponentProps<typeof MaterialIcons>['name'] {
  switch (aisleId) {
    case 'spices':
      return 'restaurant';
    case 'grains':
      return 'grass';
    case 'produce':
      return 'eco';
    case 'meat':
      return 'kebab-dining';
    case 'seafood':
      return 'set-meal';
    case 'snacks':
      return 'cookie';
    default:
      return 'category';
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },

  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  promoText: { flex: 1 },
  promoTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  promoSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.onSurface },
  sectionSub: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },

  aisleSection: { marginTop: 24, paddingHorizontal: 16 },
  aisleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    rowGap: 16,
  },
  aisle: { width: '33.33%', alignItems: 'center', paddingHorizontal: 4 },
  aisleBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aisleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: 8,
  },

  hubSection: { marginTop: 24, paddingHorizontal: 16 },
  hubList: { marginTop: 12, gap: 10 },
});
