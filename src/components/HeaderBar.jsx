import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import RoleBadge from './RoleBadge';
import ConfirmModal from './ConfirmModal';

/**
 * HeaderBar Component
 * Header terintegrasi dengan informasi akun aktif, role badge, quick role switch, dan tombol logout
 */
export default function HeaderBar({
  title,
  subtitle,
  showRole = true,
  showBack = false,
  onBackPress = null,
  rightAction = null,
  onProfilePress = null,
}) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const switchRoleDev = useAuthStore((state) => state.switchRoleDev);

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pengguna';
  const roleTheme = COLORS.roles[role] || COLORS.roles.siswa;

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const handleSwitchRole = async (targetRole) => {
    setRoleModalVisible(false);
    await switchRoleDev(targetRole);
  };

  return (
    <View style={[styles.container, { backgroundColor: roleTheme.primary }]}>
      {/* Background circles decoration */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBackPress}
            activeOpacity={0.7}
            accessibilityLabel="Kembali"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.userInfo}
          onPress={onProfilePress}
          activeOpacity={onProfilePress ? 0.7 : 1}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.greeting}>Halo,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          {showRole && (
            <TouchableOpacity
              onPress={() => setRoleModalVisible(true)}
              activeOpacity={0.8}
              title="Klik untuk simulasi ganti role"
            >
              <RoleBadge role={role} size="sm" />
            </TouchableOpacity>
          )}
          {rightAction}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.8}
            title="Keluar"
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {title ? (
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
      ) : null}

      {/* Logout Confirmation Modal (Fully compatible with Web, iOS, Android) */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Konfirmasi Keluar 🚪"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        confirmColor={COLORS.danger}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutModalVisible(false)}
      />

      {/* Quick Role Switcher Modal for Class Testing */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Simulasi Switch Role 🔄</Text>
            <Text style={styles.modalSub}>
              Ubah tampilan navigator secara instan untuk menguji alur role lain:
            </Text>

            <View style={styles.roleBtnGroup}>
              {[
                { key: 'siswa', label: '🎓 Masuk Sebagai Siswa', desc: 'Lihat rapor nilai & jadwal pelajaran', color: COLORS.roles.siswa.primary },
                { key: 'guru', label: '👨‍🏫 Masuk Sebagai Guru', desc: 'Input & kelola nilai siswa kelas', color: COLORS.roles.guru.primary },
                { key: 'admin', label: '🛡️ Masuk Sebagai Admin', desc: 'Manajemen pengguna & rekapitulasi sekolah', color: COLORS.roles.admin.primary },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.roleSwitchBtn,
                    role === item.key && { borderColor: item.color, backgroundColor: COLORS.roles[item.key].badgeBg },
                  ]}
                  onPress={() => handleSwitchRole(item.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleSwitchBtnText, role === item.key && { color: item.color, fontWeight: FONT_WEIGHTS.bold }]}>
                    {item.label}
                  </Text>
                  <Text style={styles.roleSwitchBtnDesc}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setRoleModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  backIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONT_WEIGHTS.bold,
  },
  userTextContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.extraBold,
    fontSize: FONT_SIZES.md,
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: FONT_SIZES.xs,
  },
  userName: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    maxWidth: 160,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 14,
  },
  titleSection: {
    marginTop: 16,
  },
  titleText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    letterSpacing: -0.3,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  roleBtnGroup: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleSwitchBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.light.surface,
  },
  roleSwitchBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  roleSwitchBtnDesc: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.light.surfaceSubtle,
  },
  modalCloseText: {
    color: COLORS.light.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
