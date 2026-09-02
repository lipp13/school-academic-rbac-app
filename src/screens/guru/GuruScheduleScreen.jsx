import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSchool } from '../../hooks';
import { HeaderBar, ScheduleCard, ErrorBanner } from '../../components';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../../constants';

export default function GuruScheduleScreen({ navigation }) {
  const { schedules, loading, refreshing, error, fetchSchedules } = useSchool();
  const [selectedDay, setSelectedDay] = useState('Semua');

  useEffect(() => {
    fetchSchedules(selectedDay);
  }, [fetchSchedules, selectedDay]);

  const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Jadwal Mengajar"
        subtitle="Jadwal tatap muka guru & ruang kelas"
        showRole={true}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ScheduleCard schedule={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSchedules(selectedDay, true)}
            colors={[COLORS.roles.guru.primary]}
          />
        }
        ListHeaderComponent={
          <>
            <ErrorBanner message={error} />

            {/* Day Filter Chips */}
            <View style={styles.daysRow}>
              {days.map((day) => {
                const isActive = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, isActive && styles.dayChipActive]}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayChipText, isActive && styles.dayChipTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.headerInfoRow}>
              <Text style={styles.headerInfoTitle}>Mata Pelajaran & Ruang Lab</Text>
              <Text style={styles.headerInfoCount}>{schedules.length} sesi</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
              <Text style={styles.emptyDesc}>Tidak ada jadwal mengajar pada hari {selectedDay}.</Text>
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
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  dayChip: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  dayChipActive: {
    backgroundColor: COLORS.roles.guru.primary,
    borderColor: COLORS.roles.guru.primary,
  },
  dayChipText: {
    fontSize: 11,
    color: COLORS.light.textSecondary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  dayChipTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
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
    marginTop: 4,
  },
});
