import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import { RoleBadge } from '../components';

/**
 * AccessDeniedScreen (Halaman Akses Ditolak - Bab 2 Langkah 50)
 * Ditampilkan saat user mencoba mengakses screen atau fitur di luar hak akses rolenya.
 */
export default function AccessDeniedScreen({ navigation, route }) {
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const requiredRole = route?.params?.requiredRole || 'Admin / Guru';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#991B1B" />

      {/* Header Banner */}
      <View style={styles.topBanner}>
        <View style={styles.lockCircle}>
          <Text style={styles.lockEmoji}>🔒</Text>
        </View>
        <Text style={styles.bannerTitle}>Akses Ditolak</Text>
        <Text style={styles.bannerSubtitle}>403 — Unauthorized Access</Text>
      </View>

      {/* Body Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Hak Akses Tidak Mencukupi</Text>
          <Text style={styles.cardDesc}>
            Anda tidak memiliki izin keamanan (RLS & Navigation Guard) untuk membuka fitur ini.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role Akun Anda:</Text>
              <RoleBadge role={role} size="sm" />
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dibutuhkan:</Text>
              <Text style={styles.requiredText}>{requiredRole}</Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              💡 <Text style={styles.bold}>Catatan RLS:</Text> Keamanan Supabase mencegah data sensitif dibaca atau diubah di database jika role tidak sesuai policy.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>← Kembali ke Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>🚪 Ganti Akun / Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  topBanner: {
    backgroundColor: '#991B1B',
    paddingTop: 56,
    paddingBottom: 36,
    alignItems: 'center',
  },
  lockCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  lockEmoji: {
    fontSize: 36,
  },
  bannerTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    marginTop: -20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  infoBox: {
    width: '100%',
    backgroundColor: COLORS.light.surfaceSubtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  requiredText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#991B1B',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.light.border,
    marginVertical: 6,
  },
  noticeBox: {
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  noticeText: {
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    lineHeight: 18,
  },
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  logoutBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
