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
import { validateLoginForm } from '../utils';
import { ErrorBanner, ToastNotification } from '../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login, loginDemoRole, actionLoading, errorMessage, successMessage, clearError, clearSuccess } = useAuth();

  const handleLogin = async () => {
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      Alert.alert('Peringatan', validation.error);
      return;
    }
    const result = await login(email, password);
    if (!result.success && result.error) {
      Alert.alert('Gagal Masuk', result.error);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    clearError();
    clearSuccess();
    const res = await loginDemoRole(roleKey);
    if (!res.success && res.error) {
      Alert.alert('Info Demo', res.error);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Header Banner */}
      <View style={styles.topBg}>
        <View style={styles.circleDecor1} />
        <View style={styles.circleDecor2} />
        <Text style={styles.brandIcon}>🏫</Text>
        <Text style={styles.brandName}>SIAKAD Sekolah</Text>
        <Text style={styles.brandTagline}>Sistem Informasi Akademik & Nilai Siswa</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Bab 6 — Auth Lanjutan & RLS</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Login */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun 🔐</Text>
            <Text style={styles.cardSubtitle}>
              Pastikan anda sudah membuat akun terlebih dahulu.
            </Text>

            <ErrorBanner message={errorMessage} />
            {successMessage ? (
              <ToastNotification
                message={successMessage}
                type="success"
                onClose={clearSuccess}
              />
            ) : null}

            {/* Auto Demo Quick Login Section */}
            <View style={styles.demoSection}>
              <View style={styles.demoHeaderRow}>
                <Text style={styles.demoTitle}>⚡ Masuk Cepat Akun Demo (1-Klik):</Text>
                <Text style={styles.demoBadge}>Otomatis Buat Akun</Text>
              </View>
              <Text style={styles.demoSubtitle}>
                Klik role di bawah untuk langsung masuk tanpa perlu repot mengetik password:
              </Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: COLORS.roles.admin.border, backgroundColor: COLORS.roles.admin.light }]}
                  onPress={() => handleQuickDemo('admin')}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.demoBtnText, { color: COLORS.roles.admin.text }]}>🛡️ Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: COLORS.roles.guru.border, backgroundColor: COLORS.roles.guru.light }]}
                  onPress={() => handleQuickDemo('guru')}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.demoBtnText, { color: COLORS.roles.guru.text }]}>👨‍🏫 Guru</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: COLORS.roles.siswa.border, backgroundColor: COLORS.roles.siswa.light }]}
                  onPress={() => handleQuickDemo('siswa')}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.demoBtnText, { color: COLORS.roles.siswa.text }]}>🎓 Siswa</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau login dengan akun Anda</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Input Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📧  Alamat Email</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="contoh: nama@sekolah.sch.id"
                  placeholderTextColor={COLORS.light.textLight}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) clearError();
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🔒  Kata Sandi</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.light.textLight}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) clearError();
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, actionLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              {actionLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Masuk ke Sistem →</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerBox}>
              <Text style={styles.registerBoxLabel}>Belum punya akun?</Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>➕ Daftar Akun Baru (Pilih Role)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerBrand}>
            Sistem Informasi Akademik • Row Level Security (RLS) Enabled
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  topBg: {
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circleDecor1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  brandIcon: {
    fontSize: 42,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 26,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    width: '100%',
    maxWidth: 460,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  demoSection: {
    backgroundColor: '#F0FDF4',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: SPACING.md,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#166534',
  },
  demoBadge: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#15803D',
    marginBottom: 8,
    lineHeight: 15,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.extraBold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light.border,
  },
  dividerText: {
    marginHorizontal: 8,
    color: COLORS.light.textMuted,
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.medium,
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
    paddingVertical: 12,
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: 4,
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
  registerBox: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.borderLight,
    alignItems: 'center',
  },
  registerBoxLabel: {
    fontSize: 11,
    color: COLORS.light.textMuted,
    marginBottom: 8,
  },
  registerButton: {
    paddingVertical: 11,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryBg,
    width: '100%',
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  footerBrand: {
    textAlign: 'center',
    color: COLORS.light.textLight,
    fontSize: 11,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
});
