import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'compact' | 'full';
  label?: string;
}

/**
 * Collapsed to a round "+" until the item is in the cart, then expands into a
 * −/qty/+ pill. Same control in both states, so the button never moves.
 */
export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'compact',
  label = 'item',
}) => {
  const dimension = size === 'compact' ? 36 : 44;

  if (quantity === 0) {
    return (
      <Pressable
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Add ${label} to cart`}
        hitSlop={6}
        style={({ pressed }) => [
          styles.addButton,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          pressed && styles.pressed,
        ]}
      >
        <MaterialIcons name="add" size={20} color={colors.primary} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.pill, { height: dimension, borderRadius: dimension / 2 }]}>
      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel={
          quantity === 1 ? `Remove ${label} from cart` : `Decrease ${label} quantity`
        }
        hitSlop={4}
        style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}
      >
        <MaterialIcons name={quantity === 1 ? 'delete' : 'remove'} size={16} color="#fff" />
      </Pressable>

      <Text style={styles.count} accessibilityLiveRegion="polite">
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label} quantity`}
        hitSlop={4}
        style={({ pressed }) => [styles.pillButton, pressed && styles.pressed]}
      >
        <MaterialIcons name="add" size={16} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pill: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pillButton: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    minWidth: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});
