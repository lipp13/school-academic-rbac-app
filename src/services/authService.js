import { supabase } from './supabaseClient';

/**
 * Service untuk operasi Autentikasi (Clean Services Layer)
 * Mengelola komunikasi langsung dengan Supabase Auth & JWT session
 */
export const authService = {
  signIn: async ({ email, password }) => {
    return await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
  },

  signUp: async ({ email, password, fullName, role, className }) => {
    return await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: role || 'siswa',
          class_name: className || 'XII RPL 1',
        },
      },
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    return await supabase.auth.getSession();
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
