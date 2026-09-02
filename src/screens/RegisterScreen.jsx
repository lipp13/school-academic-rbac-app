import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../hooks';
import { validateRegisterForm } from '../utils';
import { ErrorBanner, ToastNotification } from '../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('siswa'); // 'siswa' | 'guru' | 'admin'
  const [className, setClassName] = useState('XII RPL 1');
  const [focusField, setFocusField] = useState(null);

  const { register, actionLoading, errorMessage, successMessage, clearError, clearSuccess } = useAuth();

  const handleRegister = async () => {
    const validation = validateRegisterForm(email, password, confirmPassword, fullName);
    if (!validation.isValid) {
      Alert.alert('Peringatan', validation.error);
      return;
    }

    const result = await register({
      email,
      password,
      fullName,
      role,
      className: role === 'siswa' ? className : null,
    });

    if (!result.success && result.error) {
      Alert.alert('Pendaftaran Gagal', result.error);
    } else if (result.success && !result.hasSession) {
      Alert.alert('Sukses', 'Akun berhasil dibuat! Silakan masuk ke aplikasi.', [
        { text: 'Masuk Sekarang', onPress: () => navigation.navigate('Login') },
      ]);
    }
  };

  const autoFillSample = (sampleRole) => {
    setRole(sampleRole);
    if (sampleRole === 'admin') {
      setFullName('Admin Utama');
      setEmail(`admin_${Date.now().toString().slice(-4)}@sekolah.sch.id`);
      setPassword('admin123456');
      setConfirmPassword('admin123456');
    } else if (sampleRole === 'guru') {
      setFullName('Pak Budi Hartono, S.Kom');
      setEmail(`guru_${Date.now().toString().slice(-4)}@sekolah.sch.id`);
      setPassword('guru123456');
      setConfirmPassword('guru123456');
    } else {
      setFullName('Alif Siswa RPL');
      setEmail(`siswa_${Date.now().toString().slice(-4)}@sekolah.sch.id`);
      setPassword('siswa123456');
      setConfirmPassword('siswa123456');
      setClassName('XII RPL 1');
    }
    clearError();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.light.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topArea}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🎓</Text>
          </View>
          <Text style={styles.pageTitle}>Daftar Akun Baru</Text>
          <Text style={styles.pageSubtitle}>
            Pilih role akun untuk menguji sistem hak akses & RLS Supabase
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <ErrorBanner message={errorMessage} />
          {successMessage ? (
            <ToastNotification
              message={successMessage}
              type="success"
              onClose={clearSuccess}
            />
          ) : null}

          {/* Role Selection Selector */}
          <View style={styles.roleSelectorSection}>
            <View style={styles.roleHeaderRow}>
              <Text style={styles.label}>Pilih Role Pengguna:</Text>
              <Text style={styles.roleSubtext}>Pilih peran di sekolah</Text>
            </View>
            <View style={styles.roleOptionsRow}>
              {[
                { key: 'siswa', label: 'Siswa', icon: '🎓', color: COLORS.roles.siswa.primary },
                { key: 'guru', label: 'Guru', icon: '👨‍🏫', color: COLORS.roles.guru.primary },
                { key: 'admin', label: 'Admin', icon: '🛡️', color: COLORS.roles.admin.primary },
              ].map((item) => {
                const isSelected = role === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.roleCard,
                      isSelected && {
                        borderColor: item.color,
                        backgroundColor: COLORS.roles[item.key].badgeBg,
                      },
                    ]}
                    onPress={() => setRole(item.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.roleIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.roleText,
                        isSelected && { color: item.color, fontWeight: FONT_WEIGHTS.extraBold },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.roleCheckDot, { backgroundColor: item.color }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.roleNote}>
              {role === 'siswa' && '📌 Siswa: Hanya bisa membaca nilai sendiri dan melihat jadwal pelajaran.'}
              {role === 'guru' && '📌 Guru: Bisa menginput & mengedit nilai kelas, melihat jadwal mengajar.'}
              {role === 'admin' && '📌 Admin: Akses penuh CRUD pengguna, ubah role, dan rekap semua nilai.'}
            </Text>

            {/* Quick Fill Sample Data */}
            <TouchableOpacity
              style={styles.quickFillBtn}
              onPress={() => autoFillSample(role)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillText}>⚡ Isi Contoh Data Cepat ({role.toUpperCase()})</Text>
            </TouchableOpacity>
          </View>

          {/* Input Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤  Nama Lengkap</Text>
            <View style={[styles.inputWrapper, focusField === 'name' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder={role === 'guru' ? 'Pak Budi Hartono, S.Kom' : role === 'admin' ? 'Administrator' : 'Alif Pratama'}
                placeholderTextColor={COLORS.light.textLight}
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  if (errorMessage) clearError();
                }}
                onFocus={() => setFocusField('name')}
                onBlur={() => setFocusField(null)}
              />
            </View>
          </View>

          {/* Input Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📧  Alamat Email</Text>
            <View style={[styles.inputWrapper, focusField === 'email' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="nama@sekolah.sch.id"
                placeholderTextColor={COLORS.light.textLight}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) clearError();
                }}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Kelas (Khusus Siswa) */}
          {role === 'siswa' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🏷️  Kelas</Text>
              <View style={[styles.inputWrapper, focusField === 'class' && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="XII RPL 1"
                  placeholderTextColor={COLORS.light.textLight}
                  value={className}
                  onChangeText={setClassName}
                  onFocus={() => setFocusField('class')}
                  onBlur={() => setFocusField(null)}
                />
              </View>
            </View>
          )}

          {/* Input Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒  Kata Sandi</Text>
            <View style={[styles.inputWrapper, focusField === 'pass' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={COLORS.light.textLight}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) clearError();
                }}
                onFocus={() => setFocusField('pass')}
                onBlur={() => setFocusField(null)}
                secureTextEntry
              />
            </View>
          </View>

          {/* Konfirmasi Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔐  Konfirmasi Kata Sandi</Text>
            <View style={[styles.inputWrapper, focusField === 'confirm' && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Ulangi kata sandi"
                placeholderTextColor={COLORS.light.textLight}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (errorMessage) clearError();
                }}
                onFocus={() => setFocusField('confirm')}
                onBlur={() => setFocusField(null)}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, actionLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Daftar Sekarang →</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    alignItems: 'center',
  },
  topArea: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
  },
  iconEmoji: {
    fontSize: 26,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    width: '100%',
    maxWidth: 460,
  },
  roleSelectorSection: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.light.surfaceSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleSubtext: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  roleOptionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 6,
    marginBottom: 8,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  roleIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  roleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textSecondary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  roleCheckDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleNote: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    lineHeight: 14,
  },
  quickFillBtn: {
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
  },
  quickFillText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.light.surface,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryBg,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    color: COLORS.light.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
