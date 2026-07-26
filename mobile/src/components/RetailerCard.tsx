import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Store } from '../shared/types';
import { colors, radius } from '../theme';

interface RetailerCardProps {
  store: Store;
  onSelect: (store: Store) => void;
  layout?: 'rail' | 'row';
}

/** Pulls the leading number out of "$2.99 Delivery" / "Free Delivery". */
const shortFee = (fee: string): string => {
  if (/free/i.test(fee)) return 'Free delivery';
  const match = fee.match(/\$[\d.]+/);
  return match ? `${match[0]} delivery` : fee;
};

/** Takes "30-45 min (Houston) / 2-Day US Air" down to "30-45 min". */
const shortEta = (eta: string): string => {
  const match = eta.match(/[\d]+-[\d]+\s*min/i);
  return match ? match[0] : eta.split('/')[0].trim();
};

export const RetailerCard: React.FC<RetailerCardProps> = ({
  store,
  onSelect,
  layout = 'rail',
}) => {
  if (layout === 'row') {
    return (
      <Pressable
        onPress={() => onSelect(store)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Image source={{ uri: store.imageUrl }} style={styles.rowImage} />
        <View style={styles.rowBody}>
          <View style={styles.rowTitleLine}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {store.name}
            </Text>
            {store.isFeatured && (
              <MaterialIcons name="verified" size={14} color={colors.secondary} />
            )}
          </View>
          <Text style={styles.rowTagline} numberOfLines={1}>
            {store.tagline}
          </Text>
          <View style={styles.metaLine}>
            <Text style={styles.metaStrong}>{shortEta(store.deliveryTime)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>{shortFee(store.deliveryFee)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <MaterialIcons name="star" size={11} color={colors.secondary} />
            <Text style={styles.meta}>{store.rating}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onSelect(store)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.rail, pressed && styles.pressed]}
    >
      <View style={styles.railImageWrap}>
        <Image source={{ uri: store.imageUrl }} style={styles.railImage} />
        {store.isFeatured && (
          <View style={styles.verifiedChip}>
            <MaterialIcons name="verified" size={10} color={colors.secondary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <Text style={styles.railTitle} numberOfLines={1}>
        {store.name}
      </Text>
      <View style={styles.metaLine}>
        <Text style={styles.metaStrong}>{shortEta(store.deliveryTime)}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {shortFee(store.deliveryFee)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  rail: { width: 168 },
  railImageWrap: {
    height: 96,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
  },
  railImage: { width: '100%', height: '100%' },
  verifiedChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: { fontSize: 9, fontWeight: '700', color: colors.secondary },
  railTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: colors.onSurface, flexShrink: 1 },
  rowTagline: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },

  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 10, color: colors.muted },
  metaStrong: { fontSize: 10, fontWeight: '700', color: colors.onSurface },
  metaDot: { fontSize: 10, color: colors.muted },

  pressed: { opacity: 0.75 },
});
