import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFlightStatus } from '../utils/airlines';
import { radius, spacing } from '../utils/theme';

export default function StatusBadge({ flight, style }) {
  const { label, color } = getFlightStatus(flight);
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
