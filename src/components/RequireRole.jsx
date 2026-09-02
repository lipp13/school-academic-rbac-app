import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import RoleBadge from './RoleBadge';

/**
 * RequireRole (Route Guard Component - Bab 1.6)
 * Memverifikasi apakah role user yang sedang aktif memenuhi kriteria 'allowed'.
 * Jika tidak diizinkan, merender pesan "Akses Ditolak" atau custom fallback.
 */
export default function RequireRole({
  allowed = [],
  children,
  fallback = null,
  showWarningCard = true,
  onNavigateBack,
}) {
  const role = useAuthStore((state) => state.role);
  const isAllowed = allowed.includes(role);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showWarningCard) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🚫</Text>
        </View>
        <Text style={styles.title}>Akses Tidak Diizinkan</Text>
        <Text style={styles.message}>
          Halaman ini hanya dapat diakses oleh role:{' '}
          <Text style={styles.boldText}>{allowed.join(' / ').toUpperCase()}</Text>.
        </Text>

        <View style={styles.roleRow}>
          <Text style={styles.roleLabel}>Role Anda saat ini:</Text>
          <RoleBadge role={role} size="sm" />
        </View>

        {onNavigateBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onNavigateBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Kembali ke Menu Utama</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.danger,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  boldText: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.light.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  roleLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
