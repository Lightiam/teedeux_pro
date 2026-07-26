import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../shared/types';
import { colors, radius } from '../theme';
import { QuantityStepper } from './QuantityStepper';

interface ProductTileProps {
  product: Product;
  quantity: number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onOpen?: (product: Product) => void;
  layout?: 'rail' | 'grid';
  showStoreName?: boolean;
  /** Grid cells are measured by the parent so two fit a row with a gutter. */
  width?: number;
}

const RAIL_WIDTH = 152;

export const ProductTile: React.FC<ProductTileProps> = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onOpen,
  layout = 'grid',
  showStoreName = false,
  width,
}) => {
  const tileWidth = layout === 'rail' ? RAIL_WIDTH : width;

  return (
    <Pressable
      onPress={() => onOpen?.(product)}
      accessibilityRole="button"
      accessibilityLabel={product.name}
      style={[styles.container, tileWidth != null && { width: tileWidth }]}
    >
      <View style={[styles.imagePlate, { height: tileWidth ?? RAIL_WIDTH }]}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        {product.isNewArrival && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        <View style={styles.stepperSlot}>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => onIncrement(product)}
            onDecrement={() => onDecrement(product)}
            label={product.name}
          />
        </View>
      </View>

      <Text style={styles.price}>
        {product.currency}
        {product.price.toFixed(2)}
      </Text>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.unit}>{product.weightOrUnit}</Text>
      {showStoreName && (
        <Text style={styles.store} numberOfLines={1}>
          {product.storeName}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  imagePlate: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    padding: 12,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stepperSlot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.onSurface,
  },
  name: {
    fontSize: 13,
    color: colors.onSurface,
    lineHeight: 17,
    marginTop: 2,
  },
  unit: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  store: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
