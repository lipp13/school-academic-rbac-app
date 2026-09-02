export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validateLoginForm(email, password) {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email wajib diisi.' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Format email tidak valid.' };
  }
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Password minimal 6 karakter.' };
  }
  return { isValid: true };
}

export function validateRegisterForm(email, password, confirmPassword, fullName) {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: 'Nama lengkap wajib diisi.' };
  }
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email wajib diisi.' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Format email tidak valid.' };
  }
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Password minimal 6 karakter.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Konfirmasi password tidak cocok.' };
  }
  return { isValid: true };
}

export function validateGradeForm({ studentId, subject, tugas, uts, uas }) {
  if (!studentId) {
    return { isValid: false, error: 'Silakan pilih siswa penerima nilai.' };
  }
  if (!subject || !subject.trim()) {
    return { isValid: false, error: 'Mata pelajaran wajib diisi.' };
  }
  const t = parseFloat(tugas);
  const u = parseFloat(uts);
  const ua = parseFloat(uas);

  if (isNaN(t) || t < 0 || t > 100) {
    return { isValid: false, error: 'Nilai Tugas harus antara 0 - 100.' };
  }
  if (isNaN(u) || u < 0 || u > 100) {
    return { isValid: false, error: 'Nilai UTS harus antara 0 - 100.' };
  }
  if (isNaN(ua) || ua < 0 || ua > 100) {
    return { isValid: false, error: 'Nilai UAS harus antara 0 - 100.' };
  }

  return { isValid: true };
}
