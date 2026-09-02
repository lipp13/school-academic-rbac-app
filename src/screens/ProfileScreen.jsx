import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { schoolService } from '../services/schoolService';
import { RoleBadge, ToastNotification, HeaderBar, ConfirmModal } from '../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import { formatDateIndo } from '../utils/formatDate';

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const profile = useAuthStore((state) => state.profile);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [nisNip, setNisNip] = useState(profile?.nis_nip || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Peringatan', 'Nama lengkap tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await schoolService.updateProfile(user.id, {
        fullName: fullName.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        nisNip: nisNip.trim(),
      });

      if (error) throw error;

      await fetchProfile(user.id);
      setIsEditing(false);
      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err) {
      Alert.alert('Gagal Memperbarui Profil', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Profil Pengguna"
        subtitle="Kelola data pribadi & informasi akun"
        showRole={true}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {successMsg ? (
          <ToastNotification
            message={successMsg}
            type="success"
            onClose={() => setSuccessMsg('')}
          />
        ) : null}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || 'Pengguna'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.roleWrapper}>
            <RoleBadge role={role} size="lg" />
          </View>
        </View>

        {/* Detail / Edit Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Informasi Data Diri</Text>
            <TouchableOpacity
              style={styles.editToggleBtn}
              onPress={() => setIsEditing(!isEditing)}
              activeOpacity={0.7}
            >
              <Text style={styles.editToggleText}>
                {isEditing ? '✕ Batal' : '✏️ Edit Data'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nama Lengkap"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile?.full_name || '-'}</Text>
            )}
          </View>

          {/* NIS / NIP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {role === 'guru' ? 'NIP (Nomor Induk Pegawai)' : 'NIS / NISN'}
            </Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={nisNip}
                onChangeText={setNisNip}
                placeholder="contoh: 2026110293"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile?.nis_nip || '-'}</Text>
            )}
          </View>

          {/* Kelas (jika siswa) */}
          {role === 'siswa' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kelas</Text>
              <Text style={styles.fieldValue}>{profile?.class_name || 'XII RPL 1'}</Text>
            </View>
          )}

          {/* Nomor HP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nomor WhatsApp / Telepon</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="08123456789"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile?.phone || '-'}</Text>
            )}
          </View>

          {/* Bio / Keterangan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bio / Deskripsi</Text>
            {isEditing ? (
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline]}
                value={bio}
                onChangeText={setBio}
                placeholder="Deskripsi singkat..."
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile?.bio || '-'}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Perubahan 💾</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Security & RLS Info Box */}
        <View style={styles.securityBox}>
          <Text style={styles.securityTitle}>🛡️ Status Keamanan & Session (Bab 6)</Text>
          <View style={styles.securityRow}>
            <Text style={styles.securityLabel}>Row Level Security (RLS):</Text>
            <Text style={styles.securityValueActive}>✅ Aktif di Supabase</Text>
          </View>
          <View style={styles.securityRow}>
            <Text style={styles.securityLabel}>Tipe Token:</Text>
            <Text style={styles.securityValue}>JWT Bearer Token</Text>
          </View>
          <View style={styles.securityRow}>
            <Text style={styles.securityLabel}>Auto Refresh Token:</Text>
            <Text style={styles.securityValue}>AsyncStorage (Enabled)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Keluar dari Aplikasi</Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <ConfirmModal
          visible={logoutModalVisible}
          title="Konfirmasi Keluar 🚪"
          message="Apakah Anda yakin ingin keluar dari akun ini?"
          confirmText="Ya, Keluar"
          cancelText="Batal"
          confirmColor={COLORS.danger}
          onConfirm={async () => {
            setLogoutModalVisible(false);
            await logout();
          }}
          onCancel={() => setLogoutModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.section,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.sm,
  },
  avatarLargeText: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.primary,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  profileEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  roleWrapper: {
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.borderLight,
  },
  cardSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  editToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryBg,
  },
  editToggleText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: FONT_SIZES.sm,
    backgroundColor: COLORS.light.surfaceSubtle,
    color: COLORS.light.textPrimary,
  },
  fieldInputMultiline: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  securityBox: {
    backgroundColor: COLORS.light.surfaceSubtle,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginBottom: SPACING.md,
  },
  securityTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
    marginBottom: SPACING.sm,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  securityLabel: {
    fontSize: 11,
    color: COLORS.light.textMuted,
  },
  securityValue: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.light.textSecondary,
  },
  securityValueActive: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
