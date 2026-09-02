import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

export default function ToastNotification({ message, type = 'info', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isDanger = type === 'error' || type === 'danger';

  const bgColor = isSuccess ? COLORS.successLight : isDanger ? COLORS.dangerLight : COLORS.infoLight;
  const borderColor = isSuccess ? COLORS.success : isDanger ? COLORS.danger : COLORS.info;
  const textColor = isSuccess ? '#065F46' : isDanger ? '#991B1B' : '#155E75';
  const icon = isSuccess ? '✅' : isDanger ? '⚠️' : 'ℹ️';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
