/**
 * Desain Sistem Warna Terpusat (Bab 6: Auth & Role Based Application)
 * Memiliki palet khusus per role: Admin (Purple/Rose), Guru (Emerald/Teal), Siswa (Blue/Indigo)
 */
export const COLORS = {
  // Brand Primary
  primary: '#1E3A8A', // Classic Deep Navy
  primaryLight: '#3B82F6',
  primaryDark: '#172554',
  primaryBg: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // Role Badges & Themes
  roles: {
    admin: {
      primary: '#7C3AED', // Purple
      light: '#EDE9FE',
      border: '#DDD6FE',
      text: '#5B21B6',
      gradient: ['#7C3AED', '#6D28D9'],
      badgeBg: '#F5F3FF',
      icon: '🛡️',
      title: 'Administrator',
    },
    guru: {
      primary: '#059669', // Emerald
      light: '#D1FAE5',
      border: '#A7F3D0',
      text: '#065F46',
      gradient: ['#059669', '#047857'],
      badgeBg: '#ECFDF5',
      icon: '👨‍🏫',
      title: 'Dewan Guru',
    },
    siswa: {
      primary: '#2563EB', // Blue
      light: '#DBEAFE',
      border: '#BFDBFE',
      text: '#1E40AF',
      gradient: ['#2563EB', '#1D4ED8'],
      badgeBg: '#EFF6FF',
      icon: '🎓',
      title: 'Siswa / Pelajar',
    },
  },

  // Predicate Grades Colors
  grades: {
    A: { color: '#059669', bg: '#D1FAE5', border: '#6EE7B7', label: 'Sangat Baik' },
    B: { color: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', label: 'Baik' },
    C: { color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', label: 'Cukup' },
    D: { color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5', label: 'Perlu Perbaikan' },
  },

  // Status & Feedback
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  info: '#06B6D4',
  infoLight: '#ECFEFF',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Light Theme
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    card: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textLight: '#94A3B8',
  },

  // Dark Theme
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSubtle: '#334155',
    card: '#1E293B',
    border: '#334155',
    borderLight: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textLight: '#64748B',
  },
};
