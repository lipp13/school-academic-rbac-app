import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#991B1B',
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 18,
  },
});
