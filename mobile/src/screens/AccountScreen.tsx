import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { mockTransactions, mockUserProfile } from '../shared/mockData';
import { colors, radius } from '../theme';

export const AccountScreen: React.FC = () => {
  const user = mockUserProfile;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profile}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        <View style={styles.profileText}>
          <View style={styles.nameLine}>
            <Text style={styles.name}>{user.name}</Text>
            {user.isVerified && (
              <MaterialIcons name="verified" size={16} color={colors.secondary} />
            )}
          </View>
          <Text style={styles.email}>{user.email}</Text>
          {user.membershipTier && (
            <View style={styles.tierChip}>
              <Text style={styles.tierText}>{user.membershipTier}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statRow}>
        <Stat label="Wallet" value={`$${user.walletBalance.toFixed(2)}`} />
        <Stat label="Points" value={String(user.loyaltyPoints)} />
      </View>

      <Section title="Delivery address">
        <Text style={styles.body}>{user.defaultAddress}</Text>
      </Section>

      <Section title="Recent orders">
        {mockTransactions.slice(0, 3).map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <Image source={{ uri: tx.storeImageUrl }} style={styles.txImage} />
            <View style={styles.txBody}>
              <Text style={styles.txStore} numberOfLines={1}>
                {tx.storeName}
              </Text>
              <Text style={styles.txMeta}>
                {tx.date} • {tx.status}
              </Text>
            </View>
            <Text style={styles.txAmount}>${tx.amount.toFixed(2)}</Text>
          </View>
        ))}
      </Section>

      <Pressable style={styles.signOut} accessibilityRole="button">
        <MaterialIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

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
  profileText: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 17, fontWeight: '800', color: colors.onSurface },
  email: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  tierChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
  },
  tierText: { fontSize: 10, fontWeight: '700', color: colors.primary },

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

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.onSurface },
  sectionBody: { marginTop: 10, gap: 10 },
  body: { fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 19 },

  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txImage: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh },
  txBody: { flex: 1 },
  txStore: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  txMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: '800', color: colors.primary },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: colors.danger },
});
