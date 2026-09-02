import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';
import { calculateFinalScore, getPredicateInfo } from '../utils/gradeCalculator';

/**
 * GradeCard Component
 * Menampilkan rincian nilai siswa per mata pelajaran dengan predikat warna-warni
 */
export default function GradeCard({
  grade,
  showStudentName = false,
  showTeacherName = true,
  onEdit = null,
  onDelete = null,
}) {
  const finalScore = grade.nilai_akhir !== undefined && grade.nilai_akhir !== null
    ? parseFloat(grade.nilai_akhir)
    : calculateFinalScore(grade.tugas, grade.uts, grade.uas);
  const predInfo = getPredicateInfo(finalScore);

  return (
    <View style={styles.card}>
      {/* Header Row: Mata Pelajaran & Predikat */}
      <View style={styles.headerRow}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subject}>{grade.subject}</Text>
          <Text style={styles.className}>{grade.class_name || 'XII RPL 1'} • {grade.semester || 'Ganjil'}</Text>
        </View>
        <View style={[styles.predicateBadge, { backgroundColor: predInfo.bgColor, borderColor: predInfo.borderColor }]}>
          <Text style={[styles.predicateLetter, { color: predInfo.color }]}>
            {predInfo.grade}
          </Text>
          <Text style={[styles.predicateLabel, { color: predInfo.color }]}>
            {predInfo.label}
          </Text>
        </View>
      </View>

      {/* Info Tambahan Siswa / Guru */}
      {showStudentName && grade.student_name ? (
        <View style={styles.personRow}>
          <Text style={styles.personLabel}>Siswa:</Text>
          <Text style={styles.personName}>{grade.student_name}</Text>
        </View>
      ) : null}

      {showTeacherName && grade.teacher_name ? (
        <View style={styles.personRow}>
          <Text style={styles.personLabel}>Guru:</Text>
          <Text style={styles.personName}>{grade.teacher_name}</Text>
        </View>
      ) : null}

      {/* Breakdown Nilai */}
      <View style={styles.scoresGrid}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreTitle}>Tugas (30%)</Text>
          <Text style={styles.scoreValue}>{grade.tugas ?? 0}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreTitle}>UTS (30%)</Text>
          <Text style={styles.scoreValue}>{grade.uts ?? 0}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreTitle}>UAS (40%)</Text>
          <Text style={styles.scoreValue}>{grade.uas ?? 0}</Text>
        </View>
        <View style={[styles.scoreItem, styles.scoreItemFinal]}>
          <Text style={styles.scoreTitleFinal}>Nilai Akhir</Text>
          <Text style={styles.scoreValueFinal}>{finalScore}</Text>
        </View>
      </View>

      {/* Catatan Guru */}
      {grade.catatan ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteIcon}>💬</Text>
          <Text style={styles.noteText}>"{grade.catatan}"</Text>
        </View>
      ) : null}

      {/* Actions (Edit / Delete) */}
      {(onEdit || onDelete) && (
        <View style={styles.actionRow}>
          {onEdit ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => onEdit(grade)}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>✏️ Edit Nilai</Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => onDelete(grade)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>🗑️ Hapus</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  subjectInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  subject: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  className: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    marginTop: 2,
  },
  predicateBadge: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  predicateLetter: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    lineHeight: 20,
  },
  predicateLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  personLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
  },
  personName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.light.textSecondary,
  },
  scoresGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.light.surfaceSubtle,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreTitle: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  scoreValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
    marginTop: 2,
  },
  scoreItemFinal: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.light.border,
    paddingLeft: SPACING.xs,
  },
  scoreTitleFinal: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  scoreValueFinal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.primary,
    marginTop: 1,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  noteIcon: {
    fontSize: 14,
  },
  noteText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.borderLight,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  editBtn: {
    backgroundColor: COLORS.primaryBg,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  deleteBtn: {
    backgroundColor: COLORS.dangerLight,
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
