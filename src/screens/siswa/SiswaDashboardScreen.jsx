import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSchool, useAuth } from '../../hooks';
import { HeaderBar, GradeCard, ErrorBanner } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function SiswaDashboardScreen({ navigation }) {
  const { grades, loading, refreshing, error, fetchGrades } = useSchool();
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Siswa';
  const className = profile?.class_name || 'XII RPL 1';
  const nisn = profile?.nis_nip || 'NISN: 0065281920';

  // Hitung Rata-rata Nilai
  const totalMapel = grades.length;
  const avgScore = totalMapel > 0
    ? (grades.reduce((acc, curr) => {
        const score = curr.nilai_akhir !== undefined && curr.nilai_akhir !== null
          ? parseFloat(curr.nilai_akhir)
          : ((parseFloat(curr.tugas) || 0) * 0.3) + ((parseFloat(curr.uts) || 0) * 0.3) + ((parseFloat(curr.uas) || 0) * 0.4);
        return acc + (isNaN(score) ? 0 : score);
      }, 0) / totalMapel).toFixed(1)
    : '0';

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Rapor Nilai Siswa"
        subtitle="Hasil evaluasi belajar semester aktif"
        showRole={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GradeCard
            grade={item}
            showStudentName={false}
            showTeacherName={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGrades(true)}
            colors={[COLORS.roles.siswa.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <ErrorBanner message={error} />

            {/* Student Info Card */}
            <View style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{displayName}</Text>
                  <Text style={styles.studentClass}>{className}</Text>
                  <Text style={styles.studentSchool}>SMK Taruna Bhakti</Text>
                  <Text style={styles.studentSchool}>Jurusan Rekayasa Perangkat Lunak</Text>
                  <Text style={styles.studentSchool}>{nisn}</Text>
                </View>
              </View>

              {/* Rapor Stats */}
              <View style={styles.studentStatsRow}>
                <View style={styles.studentStatItem}>
                  <Text style={styles.studentStatNum}>{avgScore}</Text>
                  <Text style={styles.studentStatLabel}>Rata-Rata Nilai</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.studentStatItem}>
                  <Text style={styles.studentStatNum}>{totalMapel}</Text>
                  <Text style={styles.studentStatLabel}>Mata Pelajaran</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.studentStatItem}>
                  <Text style={[styles.studentStatNum, { color: COLORS.success }]}>
                    {parseFloat(avgScore) >= 78 ? 'Tuntas' : 'Perlu Ditingkatkan'}
                  </Text>
                  <Text style={styles.studentStatLabel}>Status Belajar</Text>
                </View>
              </View>
            </View>

            {/* Schedule Quick Link */}
            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={() => navigation.navigate('SiswaSchedule')}
              activeOpacity={0.85}
            >
              <View style={styles.scheduleBtnInfo}>
                <Text style={styles.scheduleBtnIcon}>📅</Text>
                <View>
                  <Text style={styles.scheduleBtnTitle}>Jadwal Pelajaran Kelas {className}</Text>
                  <Text style={styles.scheduleBtnSub}>Cek jam belajar dan guru pengajar hari ini</Text>
                </View>
              </View>
              <Text style={styles.scheduleBtnArrow}>→</Text>
            </TouchableOpacity>

            {/* RLS Security Banner */}
            <View style={styles.rlsInfoBox}>
              <Text style={styles.rlsInfoIcon}>🛡️</Text>
              <Text style={styles.rlsInfoText}>
                <Text style={styles.bold}>Row Level Security (RLS) Aktif:</Text> Anda hanya dapat melihat data nilai milik sendiri. Nilai siswa lain otomatis terisolasi di level database Supabase.
              </Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rincian Nilai per Mata Pelajaran</Text>
              <Text style={styles.sectionSubTitle}>{grades.length} mata pelajaran</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={styles.emptyTitle}>Belum ada nilai yang diinput guru</Text>
              <Text style={styles.emptyDesc}>
                Nilai tugas, UTS, dan UAS akan muncul di sini setelah guru pengampu menginputnya.
              </Text>
            </View>
          )
        }
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
  studentCard: {
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
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.borderLight,
  },
  studentAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.roles.siswa.badgeBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.roles.siswa.border,
  },
  studentAvatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.roles.siswa.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.light.textPrimary,
  },
  studentClass: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textSecondary,
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  studentSchool: {
    fontSize: 10,
    color: COLORS.light.textMuted,
  },
  studentStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  studentStatNum: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.roles.siswa.primary,
  },
  studentStatLabel: {
    fontSize: 10,
    color: COLORS.light.textMuted,
    marginTop: 2,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.light.border,
  },
  scheduleBtn: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.md,
  },
  scheduleBtnInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  scheduleBtnIcon: {
    fontSize: 24,
  },
  scheduleBtnTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  scheduleBtnSub: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  scheduleBtnArrow: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  rlsInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: SPACING.xs,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  rlsInfoIcon: {
    fontSize: 16,
  },
  rlsInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  bold: {
    fontWeight: FONT_WEIGHTS.bold,
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
  sectionSubTitle: {
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
  emptyDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.light.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
