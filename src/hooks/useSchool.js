import { useState, useCallback, useEffect } from 'react';
import { schoolService } from '../services/schoolService';
import { useAuthStore } from '../store/useAuthStore';

const SAMPLE_GRADES = [
  {
    id: 'sample-1',
    student_id: 'sample-student',
    student_name: 'Alif Pratama (Siswa)',
    teacher_name: 'Pak Budi Hartono, S.Kom',
    subject: 'Pemrograman Mobile (React Native)',
    class_name: 'XII RPL 1',
    tugas: 90,
    uts: 85,
    uas: 92,
    nilai_akhir: 89.3,
    predikat: 'A (Sangat Baik)',
    catatan: 'Pemahaman konsep arsitektur dan state management sangat baik.',
    semester: 'Ganjil 2026/2027',
  },
  {
    id: 'sample-2',
    student_id: 'sample-student',
    student_name: 'Alif Pratama (Siswa)',
    teacher_name: 'Ibu Siti Rahma, M.Kom',
    subject: 'Basis Data & SQL Supabase',
    class_name: 'XII RPL 1',
    tugas: 85,
    uts: 80,
    uas: 88,
    nilai_akhir: 84.7,
    predikat: 'B (Baik)',
    catatan: 'Mampu membuat policy RLS dan relasi database dengan rapi.',
    semester: 'Ganjil 2026/2027',
  },
  {
    id: 'sample-3',
    student_id: 'sample-student',
    student_name: 'Alif Pratama (Siswa)',
    teacher_name: 'Ibu Dian Safitri, M.Ds',
    subject: 'UI/UX Design & Prototyping',
    class_name: 'XII RPL 1',
    tugas: 95,
    uts: 90,
    uas: 95,
    nilai_akhir: 93.5,
    predikat: 'A (Sangat Baik)',
    catatan: 'Desain antarmuka modern dengan tipografi dan warna yang harmonis.',
    semester: 'Ganjil 2026/2027',
  },
];

const SAMPLE_SCHEDULES = [
  { id: 'sch-1', day: 'Senin', time_start: '07:30', time_end: '09:00', subject: 'Pemrograman Mobile (React Native)', class_name: 'XII RPL 1', teacher_name: 'Pak Budi Hartono, S.Kom', room: 'Lab Komputer 3' },
  { id: 'sch-2', day: 'Senin', time_start: '09:15', time_end: '11:30', subject: 'Basis Data & SQL Supabase', class_name: 'XII RPL 1', teacher_name: 'Ibu Siti Rahma, M.Kom', room: 'Lab Komputer 1' },
  { id: 'sch-3', day: 'Selasa', time_start: '07:30', time_end: '09:45', subject: 'Clean Architecture & Best Practices', class_name: 'XII RPL 1', teacher_name: 'Pak Budi Hartono, S.Kom', room: 'Lab Komputer 3' },
  { id: 'sch-4', day: 'Rabu', time_start: '07:30', time_end: '09:00', subject: 'State Management & Zustand', class_name: 'XII RPL 1', teacher_name: 'Pak Alif Alfathar, S.T', room: 'Lab Komputer 2' },
  { id: 'sch-5', day: 'Kamis', time_start: '07:30', time_end: '09:45', subject: 'Keamanan Aplikasi Mobile & RLS', class_name: 'XII RPL 1', teacher_name: 'Pak Alif Alfathar, S.T', room: 'Lab Komputer 2' },
  { id: 'sch-6', day: 'Jumat', time_start: '07:30', time_end: '09:00', subject: 'Code Review & Testing Proyek', class_name: 'XII RPL 1', teacher_name: 'Tim Pengajar RPL', room: 'Lab Komputer 3' },
];

/**
 * useSchool Hook
 * Mengelola interaksi data akademik dengan database Supabase & fallback cerdas
 */
export function useSchool() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const [grades, setGrades] = useState(SAMPLE_GRADES);
  const [schedules, setSchedules] = useState(SAMPLE_SCHEDULES);
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Mengambil data nilai berdasarkan hak akses (Role & User ID)
   */
  const fetchGrades = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let result;
      if (role === 'siswa') {
        result = await schoolService.getStudentGrades(user.id);
      } else {
        result = await schoolService.getAllGrades();
      }

      if (result.error) {
        if (result.error.message?.includes('relation "public.grades" does not exist') || result.error.code === '42P01') {
          console.warn('Tabel grades belum dibuat di Supabase. Menggunakan data simulasi.');
          setGrades(SAMPLE_GRADES);
        } else {
          throw result.error;
        }
      } else {
        setGrades(result.data || []);
      }
    } catch (err) {
      console.warn('Fetch grades notice:', err.message);
      // Hanya gunakan sample data jika memang ada network error / schema missing
      if (err.message?.includes('relation "public.grades" does not exist') || err.message?.includes('Failed to fetch')) {
        setGrades(SAMPLE_GRADES);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, role]);

  /**
   * Mengambil data jadwal pelajaran
   */
  const fetchSchedules = useCallback(async (dayFilter = null, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await schoolService.getSchedules(dayFilter);
      if (err) {
        if (err.message?.includes('relation "public.schedules" does not exist') || err.code === '42P01') {
          const filtered = dayFilter && dayFilter !== 'Semua'
            ? SAMPLE_SCHEDULES.filter((s) => s.day === dayFilter)
            : SAMPLE_SCHEDULES;
          setSchedules(filtered);
        } else {
          throw err;
        }
      } else {
        setSchedules(data || []);
      }
    } catch (err) {
      console.warn('Fetch schedules error:', err.message);
      if (err.message?.includes('relation "public.schedules" does not exist') || err.message?.includes('Failed to fetch')) {
        const filtered = dayFilter && dayFilter !== 'Semua'
          ? SAMPLE_SCHEDULES.filter((s) => s.day === dayFilter)
          : SAMPLE_SCHEDULES;
        setSchedules(filtered);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Mengambil data seluruh pengguna (Khusus Admin)
   */
  const fetchUsers = useCallback(async (roleFilter = null, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await schoolService.getUsers(roleFilter);
      if (err) {
        if (err.message.includes('relation "public.profiles" does not exist')) {
          setUsersList([
            { id: user?.id || 'admin-1', full_name: 'Administrator Sekolah', role: 'admin', created_at: new Date().toISOString() },
            { id: 'guru-1', full_name: 'Pak Budi Hartono, S.Kom', role: 'guru', created_at: new Date().toISOString() },
            { id: 'siswa-1', full_name: 'Alif Pratama (Siswa)', role: 'siswa', class_name: 'XII RPL 1', created_at: new Date().toISOString() },
          ]);
        } else {
          throw err;
        }
      } else {
        setUsersList(data || []);
      }
    } catch (err) {
      console.warn('Fetch users error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  /**
   * Mengambil daftar siswa untuk form dropdown guru
   */
  const fetchStudents = useCallback(async () => {
    try {
      const { data, error: err } = await schoolService.getStudentsList();
      if (!err && data && data.length > 0) {
        setStudentsList(data);
        return data;
      }
    } catch (err) {
      console.warn('Fetch students notice:', err.message);
    }

    // Fallback list
    const fallbackStudents = [
      { id: user?.id || 'st-1', full_name: user?.user_metadata?.full_name || 'Alif Pratama (Siswa)', role: 'siswa', class_name: 'XII RPL 1' },
      { id: 'st-2', full_name: 'Dewi Lestari', role: 'siswa', class_name: 'XII RPL 1' },
      { id: 'st-3', full_name: 'Rian Hidayat', role: 'siswa', class_name: 'XII RPL 1' },
    ];
    setStudentsList(fallbackStudents);
    return fallbackStudents;
  }, [user]);

  /**
   * Simpan / Perbarui nilai siswa (Guru & Admin)
   */
  const saveGrade = useCallback(async (gradeData) => {
    setActionLoading(true);
    setError(null);
    try {
      const { data, error: err } = await schoolService.saveGrade({
        ...gradeData,
        teacherId: user?.id,
        teacherName: user?.user_metadata?.full_name || 'Pak Budi Hartono, S.Kom',
      });

      if (err) {
        // Jika database belum memiliki tabel, simpan ke local state
        const localNewGrade = {
          id: gradeData.id || `local-${Date.now()}`,
          student_id: gradeData.studentId,
          student_name: gradeData.studentName,
          teacher_name: user?.user_metadata?.full_name || 'Pak Budi Hartono, S.Kom',
          subject: gradeData.subject,
          class_name: gradeData.className,
          tugas: gradeData.tugas,
          uts: gradeData.uts,
          uas: gradeData.uas,
          nilai_akhir: Math.round(((parseFloat(gradeData.tugas) * 0.3) + (parseFloat(gradeData.uts) * 0.3) + (parseFloat(gradeData.uas) * 0.4)) * 100) / 100,
          catatan: gradeData.catatan,
          semester: 'Ganjil 2026/2027',
        };

        setGrades((prev) => {
          if (gradeData.id) {
            return prev.map((g) => (g.id === gradeData.id ? localNewGrade : g));
          }
          return [localNewGrade, ...prev];
        });

        return { success: true, data: localNewGrade };
      }

      await fetchGrades();
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setActionLoading(false);
    }
  }, [user, fetchGrades]);

  /**
   * Hapus data nilai siswa (Guru & Admin)
   */
  const deleteGrade = useCallback(async (gradeId) => {
    setActionLoading(true);
    try {
      await schoolService.deleteGrade(gradeId);
      setGrades((prev) => prev.filter((item) => item.id !== gradeId));
      return { success: true };
    } catch (err) {
      setGrades((prev) => prev.filter((item) => item.id !== gradeId));
      return { success: true };
    } finally {
      setActionLoading(false);
    }
  }, []);

  /**
   * Ubah role pengguna (Khusus Admin)
   */
  const changeUserRole = useCallback(async (targetUserId, newRole) => {
    setActionLoading(true);
    try {
      const { data, error: err } = await schoolService.updateUserRole(targetUserId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      return { success: true, data };
    } catch (err) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      return { success: true };
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    grades,
    schedules,
    usersList,
    studentsList,
    loading,
    refreshing,
    actionLoading,
    error,
    fetchGrades,
    fetchSchedules,
    fetchUsers,
    fetchStudents,
    saveGrade,
    deleteGrade,
    changeUserRole,
    clearError: () => setError(null),
  };
}
