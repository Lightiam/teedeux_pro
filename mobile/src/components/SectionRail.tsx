import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface SectionRailProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

/**
 * Titled horizontal scroller. Content runs past the right edge so the clipped
 * card signals there is more to scroll to.
 */
export const SectionRail: React.FC<SectionRailProps> = ({
  title,
  subtitle,
  onSeeAll,
  children,
}) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      )}
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {children}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 18, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  seeAll: { fontSize: 12, fontWeight: '700', color: colors.primary },
  railContent: { paddingHorizontal: 16, gap: 12 },
});
