import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import RoleBadge from './RoleBadge';
import { formatDateIndo } from '../utils/formatDate';

/**
 * UserItem Component
 * Menampilkan item pengguna pada dashboard Admin dengan aksi pengubahan Role
 */
export default function UserItem({ user, onRoleChangePress }) {
  const initials = (user.full_name || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.infoCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.full_name || 'Tanpa Nama'}
          </Text>
        </View>

        <Text style={styles.subInfo}>
          {user.class_name ? `Kelas: ${user.class_name}` : 'Sistem Sekolah'} • Terdaftar: {formatDateIndo(user.created_at)}
        </Text>

        <View style={styles.badgeRow}>
          <RoleBadge role={user.role} size="sm" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.changeRoleBtn}
        onPress={() => onRoleChangePress(user)}
        activeOpacity={0.8}
      >
        <Text style={styles.changeRoleText}>Ubah Role ⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.primary,
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  subInfo: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    marginTop: 2,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  changeRoleBtn: {
    backgroundColor: COLORS.roles.admin.light,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.roles.admin.border,
  },
  changeRoleText: {
    color: COLORS.roles.admin.text,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
