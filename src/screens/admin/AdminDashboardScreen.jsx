import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSchool, useAuth } from '../../hooks';
import { HeaderBar, UserItem, RoleBadge, ToastNotification, ErrorBanner } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function AdminDashboardScreen({ navigation }) {
  const { usersList, loading, refreshing, actionLoading, error, fetchUsers, changeUserRole } = useSchool();
  const { user: currentUser } = useAuth();

  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadData = useCallback(() => {
    fetchUsers(roleFilter);
  }, [fetchUsers, roleFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter & Search List
  const filteredUsers = usersList.filter((item) => {
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    const matchesSearch =
      (item.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.class_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Calculate Statistics
  const totalUsers = usersList.length;
  const totalGuru = usersList.filter((u) => u.role === 'guru').length;
  const totalSiswa = usersList.filter((u) => u.role === 'siswa').length;
  const totalAdmin = usersList.filter((u) => u.role === 'admin').length;

  const handleOpenRoleModal = (targetUser) => {
    setSelectedUser(targetUser);
    setModalVisible(true);
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedUser) return;
    if (selectedUser.role === newRole) {
      setModalVisible(false);
      return;
    }

    const res = await changeUserRole(selectedUser.id, newRole);
    setModalVisible(false);

    if (res.success) {
      setToastMsg(`Role untuk ${selectedUser.full_name || 'pengguna'} diubah menjadi ${newRole.toUpperCase()}!`);
    } else {
      Alert.alert('Gagal Mengubah Role', res.error || 'Terjadi kesalahan');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Admin SIAKAD"
        subtitle="Manajemen Pengguna & Pengaturan Hak Akses (RLS)"
        showRole={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onRoleChangePress={handleOpenRoleModal}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUsers(roleFilter, true)}
            colors={[COLORS.roles.admin.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {toastMsg ? (
              <ToastNotification
                message={toastMsg}
                type="success"
                onClose={() => setToastMsg('')}
              />
            ) : null}

            <ErrorBanner message={error} />

            {/* Quick Action to Manage All Grades */}
            <TouchableOpacity
              style={styles.manageGradesBtn}
              onPress={() => navigation.navigate('ManageGrades')}
              activeOpacity={0.85}
            >
              <View style={styles.manageGradesInfo}>
                <Text style={styles.manageGradesIcon}>📊</Text>
                <View>
                  <Text style={styles.manageGradesTitle}>Rekapitulasi Nilai Sekolah</Text>
                  <Text style={styles.manageGradesSub}>Lihat & Kelola seluruh data nilai siswa</Text>
                </View>
              </View>
              <Text style={styles.manageGradesArrow}>→</Text>
            </TouchableOpacity>

            {/* Metric Cards Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderTopColor: COLORS.roles.admin.primary }]}>
                <Text style={styles.statNumber}>{totalUsers}</Text>
                <Text style={styles.statLabel}>Total Akun</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: COLORS.roles.guru.primary }]}>
                <Text style={[styles.statNumber, { color: COLORS.roles.guru.primary }]}>{totalGuru}</Text>
                <Text style={styles.statLabel}>Guru</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: COLORS.roles.siswa.primary }]}>
                <Text style={[styles.statNumber, { color: COLORS.roles.siswa.primary }]}>{totalSiswa}</Text>
                <Text style={styles.statLabel}>Siswa</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: '#7C3AED' }]}>
                <Text style={[styles.statNumber, { color: '#7C3AED' }]}>{totalAdmin}</Text>
                <Text style={styles.statLabel}>Admin</Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari nama pengguna atau kelas..."
                placeholderTextColor={COLORS.light.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Role Filter Tabs */}
            <View style={styles.filterTabs}>
              {[
                { key: 'all', label: `Semua (${totalUsers})` },
                { key: 'siswa', label: `Siswa (${totalSiswa})` },
                { key: 'guru', label: `Guru (${totalGuru})` },
                { key: 'admin', label: `Admin (${totalAdmin})` },
              ].map((tab) => {
                const isActive = roleFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.filterTab, isActive && styles.filterTabActive]}
                    onPress={() => setRoleFilter(tab.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>Daftar Pengguna Terdaftar</Text>
              <Text style={styles.sectionSubHeading}>{filteredUsers.length} ditemukan</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>Tidak ada pengguna</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery
                  ? 'Tidak ada pengguna yang cocok dengan kata kunci pencarian.'
                  : 'Belum ada data pengguna dalam filter ini.'}
              </Text>
            </View>
          )
        }
      />

      {/* Role Switcher Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubah Role Pengguna 🛡️</Text>
            <Text style={styles.modalSub}>
              Pilih hak akses baru untuk <Text style={styles.boldText}>{selectedUser?.full_name}</Text>
            </Text>

            <View style={styles.rolePickerList}>
              {[
                {
                  key: 'siswa',
                  title: '🎓 Siswa / Pelajar',
                  desc: 'Hanya bisa melihat nilai sendiri & jadwal',
                  color: COLORS.roles.siswa.primary,
                },
                {
                  key: 'guru',
                  title: '👨‍🏫 Guru / Pengajar',
                  desc: 'Bisa menginput & mengedit nilai kelas',
                  color: COLORS.roles.guru.primary,
                },
                {
                  key: 'admin',
                  title: '🛡️ Administrator',
                  desc: 'Akses penuh CRUD user, role, dan semua nilai',
                  color: COLORS.roles.admin.primary,
                },
              ].map((item) => {
                const isCurrent = selectedUser?.role === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.rolePickerItem,
                      isCurrent && { borderColor: item.color, backgroundColor: COLORS.roles[item.key].badgeBg },
                    ]}
                    onPress={() => handleUpdateRole(item.key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.rolePickerHeader}>
                      <Text style={[styles.rolePickerTitle, isCurrent && { color: item.color, fontWeight: FONT_WEIGHTS.bold }]}>
                        {item.title}
                      </Text>
                      {isCurrent && <Text style={styles.activeTag}>Role Saat Ini</Text>}
                    </View>
                    <Text style={styles.rolePickerDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.section,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  manageGradesBtn: {
    backgroundColor: COLORS.roles.admin.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    shadowColor: COLORS.roles.admin.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  manageGradesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  manageGradesIcon: {
    fontSize: 28,
  },
  manageGradesTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.extraBold,
  },
  manageGradesSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  manageGradesArrow: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderTopWidth: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textPrimary,
  },
  clearSearch: {
    color: COLORS.light.textMuted,
    fontSize: 14,
    padding: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  filterTab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.roles.admin.primary,
    borderColor: COLORS.roles.admin.primary,
  },
  filterTabText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  sectionSubHeading: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
  },
  emptyContainer: {
    padding: SPACING.section,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
    marginBottom: SPACING.lg,
  },
  boldText: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  rolePickerList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  rolePickerItem: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.light.surface,
  },
  rolePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  rolePickerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  activeTag: {
    fontSize: 10,
    color: COLORS.roles.admin.primary,
    fontWeight: FONT_WEIGHTS.bold,
    backgroundColor: COLORS.roles.admin.light,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
  },
  rolePickerDesc: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    lineHeight: 15,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.light.surfaceSubtle,
  },
  modalCancelText: {
    color: COLORS.light.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
