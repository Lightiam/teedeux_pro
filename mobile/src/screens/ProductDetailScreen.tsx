import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockProducts } from '../shared/mockData';
import { useCartContext } from '../CartContext';
import { QuantityStepper } from '../components/QuantityStepper';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const cart = useCartContext();

  const product = mockProducts.find((p) => p.id === route.params.productId);

  if (!product) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This product is no longer available.</Text>
      </View>
    );
  }

  const quantity = cart.quantityOf(product.id);
  const lineTotal = product.price * Math.max(quantity, 1);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imagePlate}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.priceLine}>
          <Text style={styles.price}>
            {product.currency}
            {product.price.toFixed(2)}
          </Text>
          <Text style={styles.unit}>{product.weightOrUnit}</Text>
        </View>

        <Text style={styles.name}>{product.name}</Text>

        {product.description && <Text style={styles.description}>{product.description}</Text>}

        <Pressable
          onPress={() => navigation.navigate('StoreDetail', { storeId: product.storeId })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.storeRow, pressed && { opacity: 0.75 }]}
        >
          <MaterialIcons name="storefront" size={22} color={colors.primary} />
          <View style={styles.storeText}>
            <Text style={styles.storeLabel}>Sold by</Text>
            <Text style={styles.storeName} numberOfLines={1}>
              {product.storeName}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
        </Pressable>

        <View style={styles.shippingNote}>
          <MaterialIcons name="local-shipping" size={16} color={colors.secondary} />
          <Text style={styles.shippingText}>Nationwide 2-day express delivery</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => cart.addItem(product)}
          onDecrement={() => cart.decrementItem(product)}
          size="full"
          label={product.name}
        />
        <Pressable
          onPress={() => {
            if (quantity === 0) cart.addItem(product);
            navigation.goBack();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>
            {quantity === 0
              ? `Add to cart • ${product.currency}${product.price.toFixed(2)}`
              : `Done • ${product.currency}${lineTotal.toFixed(2)}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24, gap: 16 },

  imagePlate: {
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLow,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', padding: 24 },

  priceLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
  unit: { fontSize: 12, color: colors.muted },

  name: { fontSize: 16, fontWeight: '700', color: colors.onSurface, lineHeight: 22, marginTop: -8 },
  description: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21 },

  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.lg,
    padding: 12,
  },
  storeText: { flex: 1 },
  storeLabel: { fontSize: 9, letterSpacing: 0.6, color: colors.onSurfaceVariant },
  storeName: { fontSize: 13, fontWeight: '700', color: colors.onSurface, marginTop: 2 },

  shippingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shippingText: { fontSize: 12, color: colors.secondary },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cta: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  missing: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  missingText: { fontSize: 14, color: colors.onSurfaceVariant },
});
