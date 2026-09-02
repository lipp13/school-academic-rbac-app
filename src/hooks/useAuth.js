import { useAuthStore } from '../store/useAuthStore';

/**
 * useAuth Hook
 * Menyediakan akses mudah ke state autentikasi, user data, role, dan fungsi-fungsi auth.
 */
export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const actionLoading = useAuthStore((state) => state.actionLoading);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const successMessage = useAuthStore((state) => state.successMessage);

  const init = useAuthStore((state) => state.init);
  const login = useAuthStore((state) => state.login);
  const loginDemoRole = useAuthStore((state) => state.loginDemoRole);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateUserRole = useAuthStore((state) => state.updateUserRole);
  const switchRoleDev = useAuthStore((state) => state.switchRoleDev);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const clearError = useAuthStore((state) => state.clearError);
  const clearSuccess = useAuthStore((state) => state.clearSuccess);

  return {
    session,
    user,
    role,
    profile,
    loading,
    actionLoading,
    errorMessage,
    successMessage,
    init,
    login,
    loginDemoRole,
    register,
    logout,
    updateUserRole,
    switchRoleDev,
    fetchProfile,
    clearError,
    clearSuccess,
  };
}
