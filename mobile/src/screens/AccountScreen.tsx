import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { orderApi, profileApi } from '../api/endpoints';
import type { ApiOrder } from '../api/types';
import { useAuth } from '../AuthContext';
import { colors, radius } from '../theme';

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AccountScreen: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [busy, setBusy] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const { orders: loaded } = await orderApi.list();
      setOrders(loaded);
    } catch {
      // A missing order list is a lesser failure than a blank account screen.
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const topUp = async () => {
    setBusy(true);
    try {
      const { user: updated } = await profileApi.topUpWallet(25);
      setUser(updated);
    } catch {
      // Surfaced by the unchanged balance; no destructive partial state.
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profile}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.profileText}>
          <View style={styles.nameLine}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {user.isPlusMember && (
              <MaterialIcons name="verified" size={16} color={colors.secondary} />
            )}
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${user.walletBalance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{user.loyaltyPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <Pressable
        onPress={topUp}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.topUp, (pressed || busy) && { opacity: 0.75 }]}
      >
        <MaterialIcons name="add-circle-outline" size={18} color="#fff" />
        <Text style={styles.topUpText}>{busy ? 'Adding…' : 'Add $25 to wallet'}</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <Text style={styles.body}>{user.defaultAddress ?? 'Not set'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent orders</Text>
        {orders.length === 0 ? (
          <Text style={styles.body}>No orders yet.</Text>
        ) : (
          <View style={styles.orderList}>
            {orders.slice(0, 5).map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <Image source={{ uri: order.storeImageUrl }} style={styles.orderImage} />
                <View style={styles.orderBody}>
                  <Text style={styles.orderStore} numberOfLines={1}>
                    {order.storeName}
                  </Text>
                  <Text style={styles.orderMeta}>
                    {formatDate(order.placedAt)} • {order.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.orderAmount}>${order.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Pressable
        onPress={() => void logout()}
        accessibilityRole="button"
        style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}
      >
        <MaterialIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32, gap: 16 },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceHigh },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 26, fontWeight: '800' },
  profileText: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 17, fontWeight: '800', color: colors.onSurface, flexShrink: 1 },
  email: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },

  statRow: { flexDirection: 'row', gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },

  topUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 13,
  },
  topUpText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.onSurface, marginBottom: 8 },
  body: { fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 19 },

  orderList: { gap: 10 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderImage: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
  },
  orderBody: { flex: 1 },
  orderStore: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  orderMeta: { fontSize: 11, color: colors.muted, marginTop: 2, textTransform: 'capitalize' },
  orderAmount: { fontSize: 13, fontWeight: '800', color: colors.primary },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: colors.danger },
});
