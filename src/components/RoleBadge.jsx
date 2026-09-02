import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

/**
 * RoleBadge Component
 * Menampilkan label visual role user (Admin, Guru, Siswa)
 */
export default function RoleBadge({ role = 'siswa', size = 'md', style }) {
  const roleKey = (role || 'siswa').toLowerCase();
  const roleConfig = COLORS.roles[roleKey] || COLORS.roles.siswa;

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: roleConfig.badgeBg,
          borderColor: roleConfig.border,
        },
        isSmall && styles.badgeSm,
        isLarge && styles.badgeLg,
        style,
      ]}
    >
      <Text style={[styles.icon, isSmall && styles.iconSm, isLarge && styles.iconLg]}>
        {roleConfig.icon}
      </Text>
      <Text
        style={[
          styles.text,
          { color: roleConfig.text },
          isSmall && styles.textSm,
          isLarge && styles.textLg,
        ]}
      >
        {roleConfig.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    gap: 3,
  },
  badgeLg: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 7,
  },
  icon: {
    fontSize: 13,
  },
  iconSm: {
    fontSize: 11,
  },
  iconLg: {
    fontSize: 16,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
  },
  textLg: {
    fontSize: FONT_SIZES.sm,
  },
});
