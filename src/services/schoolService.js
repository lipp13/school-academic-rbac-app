import { supabase } from './supabaseClient';
import { calculateFinalScore, getPredicateInfo } from '../utils/gradeCalculator';

/**
 * Service untuk Data Akademik Sekolah (Clean Services Layer)
 * Mengelola interaksi dengan tabel profiles, grades, dan schedules di Supabase
 * dengan jaminan proteksi RLS di sisi database.
 */
export const schoolService = {
  /**
   * Mengambil semua profil pengguna (Admin dapat melihat semua dan filter berdasarkan role)
   */
  getUsers: async (roleFilter = null) => {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    return await query;
  },

  /**
   * Mengambil daftar siswa khusus untuk dropdown/pilihan input nilai
   */
  getStudentsList: async () => {
    return await supabase
      .from('profiles')
      .select('id, full_name, role, class_name, avatar_url, nis_nip')
      .eq('role', 'siswa')
      .order('full_name', { ascending: true });
  },

  /**
   * Mengambil daftar guru
   */
  getTeachersList: async () => {
    return await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, nis_nip')
      .eq('role', 'guru')
      .order('full_name', { ascending: true });
  },

  /**
   * Memperbarui role pengguna (Hanya berhasil dieksekusi jika user login adalah Admin via RLS)
   */
  updateUserRole: async (userId, newRole) => {
    return await supabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
  },

  /**
   * Memperbarui informasi profil pengguna sendiri
   */
  updateProfile: async (userId, { fullName, bio, phone, nisNip, className, avatarUrl }) => {
    const updatePayload = {
      updated_at: new Date().toISOString(),
    };
    if (fullName !== undefined) updatePayload.full_name = fullName;
    if (bio !== undefined) updatePayload.bio = bio;
    if (phone !== undefined) updatePayload.phone = phone;
    if (nisNip !== undefined) updatePayload.nis_nip = nisNip;
    if (className !== undefined) updatePayload.class_name = className;
    if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;

    return await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();
  },

  /**
   * Mengambil data nilai milik siswa tertentu (Siswa hanya bisa mengambil miliknya via RLS)
   */
  getStudentGrades: async (studentId) => {
    return await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
  },

  /**
   * Mengambil seluruh data nilai (Guru & Admin)
   */
  getAllGrades: async () => {
    return await supabase
      .from('grades')
      .select('*')
      .order('created_at', { ascending: false });
  },

  /**
   * Menyimpan / Menginput data nilai siswa (Guru & Admin)
   */
  saveGrade: async ({
    id,
    studentId,
    studentName,
    teacherId,
    teacherName,
    subject,
    className = 'XII RPL 1',
    tugas,
    uts,
    uas,
    catatan,
    semester = 'Ganjil 2026/2027',
  }) => {
    const numTugas = parseFloat(tugas) || 0;
    const numUts = parseFloat(uts) || 0;
    const numUas = parseFloat(uas) || 0;
    const finalScore = calculateFinalScore(numTugas, numUts, numUas);
    const predInfo = getPredicateInfo(finalScore);

    const gradePayload = {
      student_id: studentId,
      student_name: studentName,
      teacher_id: teacherId,
      teacher_name: teacherName,
      subject,
      class_name: className,
      tugas: numTugas,
      uts: numUts,
      uas: numUas,
      predikat: `${predInfo.grade} (${predInfo.label})`,
      catatan: catatan || '',
      semester,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // Update existing grade
      return await supabase
        .from('grades')
        .update(gradePayload)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert new grade
      return await supabase
        .from('grades')
        .insert(gradePayload)
        .select()
        .single();
    }
  },

  /**
   * Menghapus nilai (Guru / Admin)
   */
  deleteGrade: async (gradeId) => {
    return await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);
  },

  /**
   * Mengambil jadwal pelajaran sekolah
   */
  getSchedules: async (dayFilter = null) => {
    let query = supabase
      .from('schedules')
      .select('*')
      .order('time_start', { ascending: true });

    if (dayFilter && dayFilter !== 'Semua') {
      query = query.eq('day', dayFilter);
    }

    return await query;
  },
};
