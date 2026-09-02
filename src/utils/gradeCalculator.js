/**
 * Utilitas Perhitungan Nilai Siswa
 * Rumus: Nilai Akhir = (30% * Tugas) + (30% * UTS) + (40% * UAS)
 */

export function calculateFinalScore(tugas = 0, uts = 0, uas = 0) {
  const numTugas = parseFloat(tugas) || 0;
  const numUts = parseFloat(uts) || 0;
  const numUas = parseFloat(uas) || 0;

  const score = (numTugas * 0.3) + (numUts * 0.3) + (numUas * 0.4);
  return Math.round(score * 100) / 100;
}

export function getPredicateInfo(finalScore) {
  const score = parseFloat(finalScore) || 0;

  if (score >= 88) {
    return {
      grade: 'A',
      label: 'Sangat Baik',
      color: '#059669',
      bgColor: '#D1FAE5',
      borderColor: '#6EE7B7',
      description: 'Kompetensi sangat memuaskan melampaui KKM.',
    };
  }
  if (score >= 78) {
    return {
      grade: 'B',
      label: 'Baik',
      color: '#2563EB',
      bgColor: '#DBEAFE',
      borderColor: '#93C5FD',
      description: 'Memahami kompetensi dengan baik sesuai target.',
    };
  }
  if (score >= 68) {
    return {
      grade: 'C',
      label: 'Cukup',
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FCD34D',
      description: 'Mencapai batas minimum kelulusan.',
    };
  }
  return {
    grade: 'D',
    label: 'Perlu Perbaikan',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    description: 'Belum mencapai batas kompetensi minimum (Remedial).',
  };
}
