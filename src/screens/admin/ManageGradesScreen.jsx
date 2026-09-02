import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSchool } from '../../hooks';
import { HeaderBar, GradeCard, ToastNotification, ErrorBanner, ConfirmModal } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function ManageGradesScreen({ navigation }) {
  const { grades, loading, refreshing, error, fetchGrades, deleteGrade } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [gradeToDelete, setGradeToDelete] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const filteredGrades = grades.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      (g.student_name || '').toLowerCase().includes(query) ||
      (g.subject || '').toLowerCase().includes(query) ||
      (g.class_name || '').toLowerCase().includes(query) ||
      (g.teacher_name || '').toLowerCase().includes(query)
    );
  });

  const handleEdit = (grade) => {
    navigation.navigate('GradeInput', { grade });
  };

  const handleDelete = (grade) => {
    setGradeToDelete(grade);
  };

  const handleConfirmDelete = async () => {
    if (!gradeToDelete) return;
    const grade = gradeToDelete;
    setGradeToDelete(null);
    const res = await deleteGrade(grade.id);
    if (res.success) {
      setToastMsg('Data nilai berhasil dihapus.');
    } else {
      Alert.alert('Gagal Menghapus', res.error || 'Terjadi kesalahan');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Rekapitulasi Nilai"
        subtitle="Kelola seluruh catatan akademik siswa"
        showRole={true}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={filteredGrades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GradeCard
            grade={item}
            showStudentName={true}
            showTeacherName={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGrades(true)}
            colors={[COLORS.primary]}
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

            {/* Add Grade Button */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('GradeInput')}
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnIcon}>➕</Text>
              <Text style={styles.addBtnText}>Input Nilai Siswa Baru</Text>
            </TouchableOpacity>

            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari siswa, mapel, atau kelas..."
                placeholderTextColor={COLORS.light.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.headerInfoRow}>
              <Text style={styles.headerInfoTitle}>Total Data Nilai</Text>
              <Text style={styles.headerInfoCount}>{filteredGrades.length} baris data</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>Belum ada data nilai</Text>
              <Text style={styles.emptyDesc}>
                Klik tombol "Input Nilai Siswa Baru" di atas untuk menambahkan nilai.
              </Text>
            </View>
          )
        }
      />

      {/* Delete Grade Modal */}
      <ConfirmModal
        visible={!!gradeToDelete}
        title="Hapus Data Nilai 🗑️"
        message={`Apakah Anda yakin ingin menghapus data nilai ${gradeToDelete?.subject || ''} milik ${gradeToDelete?.student_name || 'siswa ini'}?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmColor={COLORS.danger}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGradeToDelete(null)}
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
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnIcon: {
    fontSize: 16,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginBottom: SPACING.md,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textPrimary,
  },
  clearSearch: {
    color: COLORS.light.textMuted,
    fontSize: 14,
    padding: 4,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerInfoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  headerInfoCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
  },
  emptyContainer: {
    padding: SPACING.section,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
