import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSchool, useAuth } from '../../hooks';
import { HeaderBar, GradeCard, ToastNotification, ErrorBanner, ConfirmModal } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function GuruDashboardScreen({ navigation }) {
  const { grades, loading, refreshing, error, fetchGrades, deleteGrade } = useSchool();
  const { user } = useAuth();
  const [toastMsg, setToastMsg] = useState('');
  const [selectedGradeToDelete, setSelectedGradeToDelete] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleEdit = (grade) => {
    navigation.navigate('GradeInput', { grade });
  };

  const handleDelete = (grade) => {
    setSelectedGradeToDelete(grade);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGradeToDelete) return;
    const grade = selectedGradeToDelete;
    setSelectedGradeToDelete(null);
    const res = await deleteGrade(grade.id);
    if (res.success) {
      setToastMsg('Data nilai berhasil dihapus.');
    } else {
      Alert.alert('Gagal', res.error || 'Gagal menghapus nilai');
    }
  };

  // Metrics
  const totalGrades = grades.length;
  const averageScore = totalGrades > 0
    ? (grades.reduce((sum, g) => sum + (parseFloat(g.nilai_akhir) || 0), 0) / totalGrades).toFixed(1)
    : '0';
  const gradeCountA = grades.filter((g) => (parseFloat(g.nilai_akhir) || 0) >= 88).length;

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Dashboard Guru"
        subtitle="Manajemen Nilai & Kelas yang Diampu"
        showRole={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GradeCard
            grade={item}
            showStudentName={true}
            showTeacherName={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGrades(true)}
            colors={[COLORS.roles.guru.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {toastMsg ? (
              <ToastNotification
                message={toastMsg}
                type="success"
                onClose={() => setToastMsg('')}
              />
            ) : null}

            <ErrorBanner message={error} />

            {/* Quick Action Cards */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: COLORS.roles.guru.primary }]}
                onPress={() => navigation.navigate('GradeInput')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionCardIcon}>➕</Text>
                <Text style={styles.actionCardTitle}>Input Nilai</Text>
                <Text style={styles.actionCardSub}>Nilai Tugas, UTS & UAS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
                onPress={() => navigation.navigate('GuruSchedule')}
                activeOpacity={0.85}
              >
                <Text style={styles.actionCardIcon}>📅</Text>
                <Text style={styles.actionCardTitle}>Jadwal Mengajar</Text>
                <Text style={styles.actionCardSub}>Lihat jam & ruang kelas</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>{totalGrades}</Text>
                <Text style={styles.metricLabel}>Total Nilai Masuk</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricNumber, { color: COLORS.roles.guru.primary }]}>
                  {averageScore}
                </Text>
                <Text style={styles.metricLabel}>Rata-rata Kelas</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricNumber, { color: '#059669' }]}>
                  {gradeCountA}
                </Text>
                <Text style={styles.metricLabel}>Predikat A</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daftar Nilai Siswa Terbaru</Text>
              <Text style={styles.sectionCount}>{grades.length} nilai</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Belum ada nilai yang diinput</Text>
              <Text style={styles.emptySubtitle}>
                Klik tombol "Input Nilai" di atas untuk mulai memasukkan nilai siswa kelas Anda.
              </Text>
            </View>
          )
        }
      />

      {/* Delete Grade Modal */}
      <ConfirmModal
        visible={!!selectedGradeToDelete}
        title="Hapus Nilai Siswa 🗑️"
        message={`Apakah Anda yakin ingin menghapus data nilai ${selectedGradeToDelete?.subject || ''} untuk ${selectedGradeToDelete?.student_name || 'siswa ini'}?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor={COLORS.danger}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedGradeToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.section,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionCardIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionCardTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  actionCardSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.light.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  sectionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
  },
  emptyCard: {
    padding: SPACING.section,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
