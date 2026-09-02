import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { LoginScreen, RegisterScreen } from '../screens';
import AdminNavigator from './AdminNavigator';
import GuruNavigator from './GuruNavigator';
import SiswaNavigator from './SiswaNavigator';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../constants';

const Stack = createNativeStackNavigator();

/**
 * AppStack (Bab 1.4)
 * Menentukan Navigator yang dirender berdasarkan status role aktif pengguna
 */
function AppStack() {
  const role = useAuthStore((state) => state.role);

  switch (role) {
    case 'admin':
      return <AdminNavigator />;
    case 'guru':
      return <GuruNavigator />;
    case 'siswa':
      return <SiswaNavigator />;
    default:
      // Fallback default jika role belum dimuat dari profiles
      return <SiswaNavigator />;
  }
}

/**
 * AuthStack
 * Stack untuk alur pengguna yang belum login (Login & Register)
 */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.light.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/**
 * AppNavigator (Protected Route Root - Bab 1.3)
 * Menampilkan SplashScreen saat loading, AuthStack saat logout,
 * dan AppStack dengan role-based navigator saat login.
 */
export default function AppNavigator() {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashIcon}>🏫</Text>
        </View>
        <Text style={styles.splashTitle}>SIAKAD Sekolah</Text>
        <Text style={styles.splashSubtitle}>Memeriksa status sesi JWT & RLS...</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.splashSpinner} />
      </View>
    );
  }

  return session ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    padding: 24,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
  },
  splashIcon: {
    fontSize: 40,
  },
  splashTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  splashSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    marginTop: 4,
  },
  splashSpinner: {
    marginTop: 24,
  },
});
