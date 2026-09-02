import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@sekolah.sch.id',
    password: 'admin123456',
    fullName: 'Administrator Sekolah',
    role: 'admin',
    className: 'Semua Kelas',
  },
  guru: {
    email: 'guru@sekolah.sch.id',
    password: 'guru123456',
    fullName: 'Pak Budi Hartono, S.Kom',
    role: 'guru',
    className: 'XII RPL 1 & 2',
  },
  siswa: {
    email: 'siswa@sekolah.sch.id',
    password: 'siswa123456',
    fullName: 'Alif Pratama (Siswa)',
    role: 'siswa',
    className: 'XII RPL 1',
  },
};

/**
 * useAuthStore (Zustand Global State Management)
 * Dilengkapi fitur Auto-Demo Login & Self-Healing Profile Resolver
 */
export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  role: null, // 'admin' | 'guru' | 'siswa' | null
  profile: null,
  loading: true,
  actionLoading: false,
  errorMessage: '',
  successMessage: '',

  /**
   * Mengambil data profil dan role dari tabel 'profiles'
   * Jika tabel belum dibuat di Supabase, fallback aman ke metadata user
   */
  fetchProfile: async (userId, userMetadata = null) => {
    if (!userId) return null;
    const fallbackRole = userMetadata?.role || 'siswa';
    const fallbackName = userMetadata?.full_name || 'Pengguna';
    const fallbackClass = userMetadata?.class_name || 'XII RPL 1';

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        set({
          profile: data,
          role: data.role || fallbackRole,
        });
        return data;
      }

      // Self-healing: jika baris belum ada di profiles saat login, otomatis buat/upsert
      try {
        const { data: upserted, error: upsertErr } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fallbackName,
            role: fallbackRole,
            class_name: fallbackClass,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!upsertErr && upserted) {
          set({ profile: upserted, role: upserted.role || fallbackRole });
          return upserted;
        }
      } catch (upsertE) {
        console.warn('Notice self-healing upsert:', upsertE);
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    }

    const defaultProfile = {
      id: userId,
      role: fallbackRole,
      full_name: fallbackName,
      class_name: fallbackClass,
    };
    set({ profile: defaultProfile, role: fallbackRole });
    return defaultProfile;
  },

  /**
   * Inisialisasi status sesi saat aplikasi pertama kali dibuka
   */
  init: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Session init error:', error.message);
      }

      if (session?.user) {
        set({ session, user: session.user });
        const userProfile = await get().fetchProfile(session.user.id, session.user.user_metadata);
        const resolvedRole = userProfile?.role || session.user.user_metadata?.role || 'siswa';
        set({
          session,
          user: session.user,
          role: resolvedRole,
          loading: false,
        });
      } else {
        set({ session: null, user: null, role: null, profile: null, loading: false });
      }

      // Pasang listener perubahan auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          set({ session: currentSession, user: currentSession.user });
          const updatedProfile = await get().fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
          const currentRole = updatedProfile?.role || currentSession.user.user_metadata?.role || 'siswa';
          set({
            session: currentSession,
            user: currentSession.user,
            role: currentRole,
            loading: false,
          });
        } else {
          set({
            session: null,
            user: null,
            role: null,
            profile: null,
            loading: false,
          });
        }
      });

      return () => {
        subscription?.unsubscribe?.();
      };
    } catch (err) {
      console.error('Init Auth Store error:', err);
      set({ loading: false });
    }
  },

  /**
   * Masuk (Login) dengan email & password
   */
  login: async (email, password) => {
    set({ actionLoading: true, errorMessage: '', successMessage: '' });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let readableMsg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          readableMsg = 'Akun belum terdaftar di Supabase atau password salah. Silakan klik tombol "Daftar Akun Baru (Pilih Role)" di bawah.';
        } else if (error.message.includes('Email not confirmed')) {
          readableMsg = 'Email belum diverifikasi. Pastikan konfirmasi email dinonaktifkan di Supabase Auth Settings atau cek email Anda.';
        }
        set({ errorMessage: readableMsg, actionLoading: false });
        return { success: false, error: readableMsg };
      }

      if (data?.session && data?.user) {
        const userProfile = await get().fetchProfile(data.user.id, data.user.user_metadata);
        const resolvedRole = userProfile?.role || data.user.user_metadata?.role || 'siswa';
        set({
          session: data.session,
          user: data.user,
          role: resolvedRole,
          actionLoading: false,
        });
        return { success: true, data, role: resolvedRole };
      }

      set({ actionLoading: false });
      return { success: true, data };
    } catch (err) {
      const msg = 'Terjadi kesalahan sistem saat mencoba masuk.';
      set({ errorMessage: msg, actionLoading: false });
      return { success: false, error: msg };
    }
  },

  /**
   * Auto-Login Demo: Jika akun demo belum terdaftar, otomatis mendaftarkannya lalu login!
   */
  loginDemoRole: async (roleType = 'siswa') => {
    const demo = DEMO_ACCOUNTS[roleType] || DEMO_ACCOUNTS.siswa;
    set({ actionLoading: true, errorMessage: '', successMessage: '' });

    try {
      // 1. Coba login dulu
      const loginRes = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      if (!loginRes.error && loginRes.data?.session) {
        // Pastikan role disinkronkan ke role yang dipilih demo
        try {
          await supabase.from('profiles').upsert({
            id: loginRes.data.user.id,
            full_name: demo.fullName,
            role: demo.role,
            class_name: demo.className,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Sync demo profile error:', e);
        }

        await get().fetchProfile(loginRes.data.user.id, loginRes.data.user.user_metadata);
        const resolvedRole = demo.role;
        set({
          session: loginRes.data.session,
          user: loginRes.data.user,
          role: resolvedRole,
          actionLoading: false,
          successMessage: `Berhasil masuk sebagai ${demo.fullName}!`,
        });
        return { success: true, role: resolvedRole };
      }

      // 2. Jika belum terdaftar, otomatis daftarkan akun demo
      const signupRes = await supabase.auth.signUp({
        email: demo.email,
        password: demo.password,
        options: {
          data: {
            full_name: demo.fullName,
            role: demo.role,
            class_name: demo.className,
          },
        },
      });

      if (signupRes.error) {
        // Jika pendaftaran gagal karena email sudah ada tapi password beda
        set({
          errorMessage: `Gagal masuk akun demo: ${signupRes.error.message}. Silakan daftar akun manual melalui tombol di bawah.`,
          actionLoading: false,
        });
        return { success: false, error: signupRes.error.message };
      }

      // 3. Simpan profil ke tabel profiles jika session aktif
      if (signupRes.data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: signupRes.data.user.id,
            full_name: demo.fullName,
            role: demo.role,
            class_name: demo.className,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Upsert demo profile note:', e);
        }

        // Jika session langsung aktif
        if (signupRes.data?.session) {
          set({
            session: signupRes.data.session,
            user: signupRes.data.user,
            role: demo.role,
            actionLoading: false,
            successMessage: `Akun demo ${demo.role.toUpperCase()} berhasil dibuat & aktif!`,
          });
          return { success: true, role: demo.role };
        }
      }

      // 4. Coba login ulang jika signup tidak mengembalikan session langsung
      const retryLogin = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      if (retryLogin.data?.session) {
        set({
          session: retryLogin.data.session,
          user: retryLogin.data.user,
          role: demo.role,
          actionLoading: false,
          successMessage: `Berhasil masuk sebagai ${demo.fullName}!`,
        });
        return { success: true, role: demo.role };
      }

      set({
        actionLoading: false,
        successMessage: `Akun demo ${demo.role} telah dibuat. Silakan login.`,
      });
      return { success: true };
    } catch (err) {
      set({
        actionLoading: false,
        errorMessage: 'Gagal memproses login demo: ' + err.message,
      });
      return { success: false, error: err.message };
    }
  },

  /**
   * Mendaftar (Register) akun baru dengan role & nama lengkap
   */
  register: async ({ email, password, fullName = '', role = 'siswa', className = 'XII RPL 1' }) => {
    set({ actionLoading: true, errorMessage: '', successMessage: '' });
    try {
      const cleanEmail = email.trim();
      const cleanName = fullName.trim() || splitEmail(cleanEmail);
      const chosenRole = role || 'siswa';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role: chosenRole,
            class_name: className,
          },
        },
      });

      if (error) {
        set({ errorMessage: error.message, actionLoading: false });
        return { success: false, error: error.message };
      }

      // Upsert profile secara eksplisit agar profil langsung sinkron
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: cleanName,
            role: chosenRole,
            class_name: className,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Profile upsert note:', e);
        }

        // Jika session langsung aktif
        if (data.session) {
          const userProfile = await get().fetchProfile(data.user.id, data.user.user_metadata);
          const finalRole = userProfile?.role || chosenRole;
          set({
            session: data.session,
            user: data.user,
            role: finalRole,
            actionLoading: false,
            successMessage: 'Pendaftaran berhasil! Mengalihkan ke dashboard...',
          });
          return { success: true, data, hasSession: true, role: finalRole };
        }
      }

      // Coba langsung sign in jika email confirmation dinonaktifkan
      try {
        const autoSignIn = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (autoSignIn.data?.session) {
          set({
            session: autoSignIn.data.session,
            user: autoSignIn.data.user,
            role: chosenRole,
            actionLoading: false,
            successMessage: 'Pendaftaran berhasil! Mengalihkan ke aplikasi...',
          });
          return { success: true, data: autoSignIn.data, hasSession: true, role: chosenRole };
        }
      } catch (e) {
        console.warn('Auto sign-in note:', e);
      }

      set({
        actionLoading: false,
        successMessage: 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.',
      });
      return { success: true, data, hasSession: false };
    } catch (err) {
      const msg = 'Terjadi kesalahan saat pendaftaran akun.';
      set({ errorMessage: msg, actionLoading: false });
      return { success: false, error: msg };
    }
  },

  /**
   * Keluar (Logout)
   */
  logout: async () => {
    set({ actionLoading: true });
    try {
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        role: null,
        profile: null,
        actionLoading: false,
      });
      return { success: true };
    } catch (err) {
      set({
        session: null,
        user: null,
        role: null,
        profile: null,
        actionLoading: false,
      });
      return { success: true };
    }
  },

  /**
   * Mengubah role pengguna (Fitur Khusus Admin via RLS)
   */
  updateUserRole: async (targetUserId, newRole) => {
    set({ actionLoading: true, errorMessage: '' });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) throw error;

      // Jika admin mengupdate rolenya sendiri
      if (get().user?.id === targetUserId) {
        set({ role: newRole });
      }

      set({ actionLoading: false });
      return { success: true, data };
    } catch (err) {
      set({ actionLoading: false, errorMessage: err.message });
      return { success: false, error: err.message };
    }
  },

  /**
   * Switch Role Lokal (Helper Dev / Testing di Kelas)
   */
  switchRoleDev: async (newRole) => {
    set({ role: newRole });
    if (get().user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', get().user.id);
      } catch (e) {
        console.warn('Switch role notice:', e);
      }
    }
  },

  clearError: () => set({ errorMessage: '' }),
  clearSuccess: () => set({ successMessage: '' }),
}));

function splitEmail(email) {
  if (!email) return 'Pengguna';
  return email.split('@')[0];
}
