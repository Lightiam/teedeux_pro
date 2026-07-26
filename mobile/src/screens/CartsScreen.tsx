import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCartContext } from '../CartContext';
import { QuantityStepper } from '../components/QuantityStepper';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FREE_DELIVERY_THRESHOLD = 35;
const SERVICE_FEE = 1.5;

export const CartsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const cart = useCartContext();

  if (cart.storeCarts.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyIcon}>
          <MaterialIcons name="shopping-cart" size={38} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyBody}>Add items from any hub and they'll collect here.</Text>
        <Pressable
          onPress={() => navigation.navigate('Tabs', { screen: 'Browse' })}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Browse the catalog</Text>
        </Pressable>
      </View>
    );
  }

  const deliveryFee = cart.subtotal > FREE_DELIVERY_THRESHOLD ? 0 : 3.99;
  const total = cart.subtotal + deliveryFee + SERVICE_FEE;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.caption}>
        {cart.storeCarts.length} {cart.storeCarts.length === 1 ? 'hub' : 'hubs'} • each ships
        separately
      </Text>

      {cart.storeCarts.map((storeCart) => (
        <View key={storeCart.store.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={{ uri: storeCart.store.imageUrl }} style={styles.storeImage} />
            <View style={styles.cardHeaderText}>
              <Text style={styles.storeName} numberOfLines={1}>
                {storeCart.store.name}
              </Text>
              <Text style={styles.storeMeta}>
                {storeCart.itemCount} {storeCart.itemCount === 1 ? 'item' : 'items'} • $
                {storeCart.subtotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {storeCart.items.map((item) => (
            <View key={item.product.id} style={styles.line}>
              <Image source={{ uri: item.product.imageUrl }} style={styles.lineImage} />
              <View style={styles.lineBody}>
                <Text style={styles.lineName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.lineUnit}>{item.product.weightOrUnit}</Text>
                <Text style={styles.linePrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              <QuantityStepper
                quantity={item.quantity}
                onIncrement={() => cart.setQuantity(item.product.id, item.quantity + 1)}
                onDecrement={() => cart.setQuantity(item.product.id, item.quantity - 1)}
                label={item.product.name}
              />
            </View>
          ))}

          <Pressable
            onPress={() => cart.clearStore(storeCart.store.id)}
            style={styles.clearButton}
            accessibilityRole="button"
          >
            <Text style={styles.clearText}>Empty this cart</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.totals}>
        <Row label="Subtotal" value={`$${cart.subtotal.toFixed(2)}`} />
        <Row
          label="Delivery"
          value={deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
          highlight={deliveryFee === 0}
        />
        <Row label="Service fee" value={`$${SERVICE_FEE.toFixed(2)}`} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        {cart.subtotal <= FREE_DELIVERY_THRESHOLD && (
          <Text style={styles.hint}>
            Add ${(FREE_DELIVERY_THRESHOLD - cart.subtotal).toFixed(2)} more for free delivery
          </Text>
        )}
      </View>

      <Pressable style={styles.checkout} accessibilityRole="button">
        <MaterialIcons name="lock" size={18} color="#fff" />
        <Text style={styles.checkoutText}>Checkout • ${total.toFixed(2)}</Text>
      </Pressable>
    </ScrollView>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && { color: colors.secondary }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32, gap: 12 },

  caption: { fontSize: 12, color: colors.onSurfaceVariant },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  storeImage: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
  },
  cardHeaderText: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  storeMeta: { fontSize: 10, color: colors.muted, marginTop: 2 },

  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLow,
  },
  lineImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLow,
  },
  lineBody: { flex: 1 },
  lineName: { fontSize: 13, fontWeight: '600', color: colors.onSurface, lineHeight: 17 },
  lineUnit: { fontSize: 10, color: colors.muted, marginTop: 2 },
  linePrice: { fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 4 },

  clearButton: { alignItems: 'flex-end', padding: 12 },
  clearText: { fontSize: 12, fontWeight: '700', color: colors.danger },

  totals: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: 13, color: colors.onSurfaceVariant },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLow,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: colors.onSurface },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  hint: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  checkout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 15,
  },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  emptyScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.onSurface, marginTop: 16 },
  emptyBody: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
