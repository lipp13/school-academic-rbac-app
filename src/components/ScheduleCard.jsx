import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../constants';

/**
 * ScheduleCard Component
 * Menampilkan item jadwal mata pelajaran sekolah
 */
export default function ScheduleCard({ schedule }) {
  const getDayColor = (day) => {
    switch (day) {
      case 'Senin':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Selasa':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Rabu':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'Kamis':
        return { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' };
      case 'Jumat':
        return { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const dayStyle = getDayColor(schedule.day);

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={[styles.dayBadge, { backgroundColor: dayStyle.bg, borderColor: dayStyle.border }]}>
          <Text style={[styles.dayText, { color: dayStyle.text }]}>{schedule.day}</Text>
        </View>
        <Text style={styles.timeText}>
          {schedule.time_start} - {schedule.time_end}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rightCol}>
        <Text style={styles.subject}>{schedule.subject}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>👨‍🏫</Text>
          <Text style={styles.teacherName} numberOfLines={1}>
            {schedule.teacher_name}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>📍 {schedule.room}</Text>
          </View>
          <View style={[styles.tag, styles.classTag]}>
            <Text style={styles.classTagText}>🏷️ {schedule.class_name}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  leftCol: {
    width: 95,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: SPACING.xs,
  },
  dayBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 4,
  },
  dayText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    fontWeight: FONT_WEIGHTS.semiBold,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.light.border,
    marginHorizontal: SPACING.xs,
  },
  rightCol: {
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  subject: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.light.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  metaIcon: {
    fontSize: 12,
  },
  teacherName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textSecondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.light.surfaceSubtle,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    fontWeight: FONT_WEIGHTS.medium,
  },
  classTag: {
    backgroundColor: COLORS.primaryBg,
  },
  classTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
});
