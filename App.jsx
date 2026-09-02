import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useAuthStore } from './src/store/useAuthStore';
import { AppNavigator } from './src/navigation';
import { COLORS } from './src/constants';

/**
 * Root Application Component (Bab 6)
 * Menginisialisasi Zustand Auth Store & Session Supabase saat aplikasi dimuat
 */
export default function App() {
  useEffect(() => {
    // Inisialisasi status sesi JWT & role user dari Supabase
    const cleanup = useAuthStore.getState().init();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" backgroundColor={COLORS.primaryDark} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
