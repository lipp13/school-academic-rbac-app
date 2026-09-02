import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSchool } from '../../hooks';
import { calculateFinalScore, getPredicateInfo, validateGradeForm } from '../../utils';
import { HeaderBar, ErrorBanner } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function GradeInputScreen({ navigation, route }) {
  const existingGrade = route.params?.grade;
  const isEditing = !!existingGrade;

  const { studentsList, fetchStudents, saveGrade, actionLoading, error, clearError } = useSchool();

  const [selectedStudentId, setSelectedStudentId] = useState(existingGrade?.student_id || '');
  const [studentName, setStudentName] = useState(existingGrade?.student_name || '');
  const [subject, setSubject] = useState(existingGrade?.subject || 'Pemrograman Mobile (React Native)');
  const [className, setClassName] = useState(existingGrade?.class_name || 'XII RPL 1');
  const [tugas, setTugas] = useState(existingGrade?.tugas !== undefined ? String(existingGrade.tugas) : '85');
  const [uts, setUts] = useState(existingGrade?.uts !== undefined ? String(existingGrade.uts) : '80');
  const [uas, setUas] = useState(existingGrade?.uas !== undefined ? String(existingGrade.uas) : '90');
  const [catatan, setCatatan] = useState(existingGrade?.catatan || 'Pertahankan pemahaman arsitektur komponen yang baik.');
  const [showStudentPicker, setShowStudentPicker] = useState(false);

  useEffect(() => {
    fetchStudents().then((students) => {
      if (!isEditing && students && students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
        setStudentName(students[0].full_name);
      }
    });
  }, [fetchStudents, isEditing, selectedStudentId]);

  // Kalkulasi Live Real-time
  const liveFinalScore = calculateFinalScore(tugas, uts, uas);
  const livePredicate = getPredicateInfo(liveFinalScore);

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student.id);
    setStudentName(student.full_name);
    if (student.class_name) setClassName(student.class_name);
    setShowStudentPicker(false);
  };

  const handleSave = async () => {
    const validation = validateGradeForm({
      studentId: selectedStudentId,
      subject,
      tugas,
      uts,
      uas,
    });

    if (!validation.isValid) {
      Alert.alert('Peringatan Validasi', validation.error);
      return;
    }

    const payload = {
      id: existingGrade?.id,
      studentId: selectedStudentId,
      studentName: studentName || 'Siswa',
      subject: subject.trim(),
      className: className.trim(),
      tugas,
      uts,
      uas,
      catatan: catatan.trim(),
    };

    const res = await saveGrade(payload);
    if (res.success) {
      Alert.alert('Sukses', isEditing ? 'Nilai berhasil diperbarui!' : 'Nilai siswa berhasil disimpan!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Gagal Menyimpan', res.error || 'Terjadi kesalahan');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <HeaderBar
        title={isEditing ? 'Edit Nilai Siswa' : 'Input Nilai Siswa'}
        subtitle="Formula: 30% Tugas + 30% UTS + 40% UAS"
        showRole={true}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ErrorBanner message={error} />

        {/* Live Grade Preview Card */}
        <View style={[styles.previewCard, { borderColor: livePredicate.borderColor }]}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewSubject}>{subject || 'Mata Pelajaran'}</Text>
              <Text style={styles.previewStudent}>
                Siswa: <Text style={styles.boldText}>{studentName || 'Pilih Siswa'}</Text> ({className})
              </Text>
            </View>
            <View style={[styles.predicateCircle, { backgroundColor: livePredicate.bgColor }]}>
              <Text style={[styles.predicateLetter, { color: livePredicate.color }]}>
                {livePredicate.grade}
              </Text>
              <Text style={[styles.predicateScore, { color: livePredicate.color }]}>
                {liveFinalScore}
              </Text>
            </View>
          </View>
          <Text style={[styles.predicateDescription, { color: livePredicate.color }]}>
            Predikat: {livePredicate.label} — {livePredicate.description}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Pilih Siswa */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🎓  Pilih Siswa</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowStudentPicker(!showStudentPicker)}
              activeOpacity={0.8}
            >
              <Text style={studentName ? styles.pickerTriggerText : styles.pickerPlaceholder}>
                {studentName ? `👤 ${studentName} (${className})` : 'Pilih siswa dari daftar...'}
              </Text>
              <Text style={styles.pickerArrow}>{showStudentPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* Dropdown Siswa List */}
            {showStudentPicker && (
              <View style={styles.dropdownBox}>
                {studentsList.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>Tidak ada akun siswa terdaftar.</Text>
                ) : (
                  studentsList.map((st) => (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.dropdownItem,
                        selectedStudentId === st.id && styles.dropdownItemActive,
                      ]}
                      onPress={() => handleSelectStudent(st)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedStudentId === st.id && styles.dropdownItemTextActive,
                        ]}
                      >
                        👤 {st.full_name || 'Siswa'} {st.class_name ? `• ${st.class_name}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Mata Pelajaran */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📚  Mata Pelajaran</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="contoh: Pemrograman Mobile"
              placeholderTextColor={COLORS.light.textLight}
            />

            {/* Quick Mapel chips */}
            <View style={styles.chipRow}>
              {[
                'Pemrograman Mobile',
                'Basis Data & SQL',
                'Clean Architecture',
                'UI/UX Design',
              ].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, subject.includes(chip) && styles.chipActive]}
                  onPress={() => setSubject(chip)}
                >
                  <Text style={[styles.chipText, subject.includes(chip) && styles.chipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nilai Inputs Grid */}
          <View style={styles.scoresRow}>
            {/* Tugas */}
            <View style={styles.scoreCol}>
              <Text style={styles.scoreColLabel}>📝 Tugas (30%)</Text>
              <TextInput
                style={styles.scoreInput}
                value={tugas}
                onChangeText={setTugas}
                keyboardType="numeric"
                placeholder="0-100"
                maxLength={3}
              />
            </View>

            {/* UTS */}
            <View style={styles.scoreCol}>
              <Text style={styles.scoreColLabel}>📋 UTS (30%)</Text>
              <TextInput
                style={styles.scoreInput}
                value={uts}
                onChangeText={setUts}
                keyboardType="numeric"
                placeholder="0-100"
                maxLength={3}
              />
            </View>

            {/* UAS */}
            <View style={styles.scoreCol}>
              <Text style={styles.scoreColLabel}>🏆 UAS (40%)</Text>
              <TextInput
                style={styles.scoreInput}
                value={uas}
                onChangeText={setUas}
                keyboardType="numeric"
                placeholder="0-100"
                maxLength={3}
              />
            </View>
          </View>

          {/* Catatan Guru */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>💬  Catatan Evaluasi Guru</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={catatan}
              onChangeText={setCatatan}
              placeholder="Tuliskan catatan progres atau evaluasi untuk siswa..."
              placeholderTextColor={COLORS.light.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, actionLoading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Simpan Perubahan Nilai 💾' : 'Simpan Nilai Siswa ✅'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.section,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previewSubject: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  previewStudent: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    marginTop: 2,
  },
  boldText: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  predicateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  predicateLetter: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    lineHeight: 22,
  },
  predicateScore: {
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  },
  predicateDescription: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.borderLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textSecondary,
    marginBottom: 6,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.light.surfaceSubtle,
  },
  pickerTriggerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
  },
  pickerPlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.light.textLight,
  },
  pickerArrow: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  dropdownBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    marginTop: 4,
    maxHeight: 180,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryBg,
  },
  dropdownItemText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textPrimary,
  },
  dropdownItemTextActive: {
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  dropdownEmpty: {
    padding: SPACING.md,
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
    backgroundColor: COLORS.light.surfaceSubtle,
    color: COLORS.light.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: COLORS.light.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primaryBorder,
  },
  chipText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scoreCol: {
    flex: 1,
  },
  scoreColLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textSecondary,
    marginBottom: 4,
  },
  scoreInput: {
    borderWidth: 1.5,
    borderColor: COLORS.light.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    backgroundColor: COLORS.light.surfaceSubtle,
    color: COLORS.light.textPrimary,
    textAlign: 'center',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: COLORS.roles.guru.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    shadowColor: COLORS.roles.guru.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#A7F3D0',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
