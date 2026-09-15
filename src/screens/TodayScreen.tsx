import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { getEntriesBetween, getSettings } from '../db/database';
import { AppSettings, CheckInPeriod, TimeEntry } from '../types/models';
import { buildDaySlots, formatClock, getReminderMinuteMarks, localDayBounds } from '../utils/time';

type Props = {
  refreshKey: number;
  onOpenCheckIn: (period: CheckInPeriod) => void;
};

export function TodayScreen({ refreshKey, onOpenCheckIn }: Props) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const load = useCallback(async () => {
    const s = await getSettings();
    const { start, end } = localDayBounds(new Date());
    const e = await getEntriesBetween(start, end);
    setSettings(s);
    setEntries(e);
  }, []);

  useEffect(() => { load().catch(console.error); }, [load, refreshKey]);

  const slots = useMemo(() => settings ? buildDaySlots(settings, new Date(), entries) : [], [settings, entries]);

  const nextText = useMemo(() => {
    if (!settings || !settings.notification_enabled) return 'یادآوری خاموش است';
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const next = getReminderMinuteMarks(settings).find((m) => m > current);
    if (next === undefined) return 'یادآوری امروز تمام شده';
    return `یادآوری بعدی: ${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`;
  }, [settings]);

  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    } catch {
      return 'امروز';
    }
  }, []);

  return (
    <ScreenShell title="امروز" subtitle={`${dateLabel} · ${nextText}`}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>بازه‌های ثبت‌شده امروز</Text>
        <Text style={styles.summaryNumber}>{entries.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>خط زمانی</Text>
      {slots.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>برای امروز بازه‌ای تعریف نشده است. تنظیمات یادآوری را بررسی کن.</Text>
        </View>
      ) : (
        slots.slice().reverse().map((slot) => {
          const logged = slot.entry;
          return (
            <Pressable
              key={slot.start.toISOString()}
              disabled={slot.isFuture}
              accessibilityRole="button"
              onPress={() => onOpenCheckIn({ start: slot.start, end: slot.end, source: 'manual' })}
              style={({ pressed }) => [styles.slot, slot.isFuture && styles.futureSlot, pressed && !slot.isFuture && styles.pressed]}
            >
              <Text style={styles.slotTime}>{formatClock(slot.start)}–{formatClock(slot.end)}</Text>
              <View style={styles.slotActivity}>
                <Text style={styles.slotIcon}>{logged?.activity_icon ?? (slot.isFuture ? '○' : '❓')}</Text>
                <Text style={[styles.slotName, !logged && styles.muted]}>
                  {logged?.activity_name ?? (slot.isFuture ? 'آینده' : 'ثبت نشده — برای ثبت لمس کن')}
                </Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#171A20',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  summaryLabel: { color: '#D5D8DE', fontSize: 14, fontWeight: '600' },
  summaryNumber: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  sectionTitle: { textAlign: 'right', fontSize: 18, fontWeight: '800', color: '#16181C', marginBottom: 10 },
  slot: {
    minHeight: 66,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8DCE2',
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  futureSlot: { opacity: 0.4 },
  pressed: { opacity: 0.55 },
  slotTime: { fontSize: 13, color: '#656C77', minWidth: 92 },
  slotActivity: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  slotIcon: { fontSize: 24 },
  slotName: { flex: 1, textAlign: 'right', fontSize: 14, color: '#1A1D22', fontWeight: '600' },
  muted: { color: '#7A818C', fontWeight: '500' },
  emptyCard: { borderRadius: 18, borderWidth: 1, borderColor: '#E0E3E8', padding: 18, backgroundColor: '#FFFFFF' },
  emptyText: { textAlign: 'right', color: '#656C77', lineHeight: 22 },
});
