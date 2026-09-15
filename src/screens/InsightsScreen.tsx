import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { getInsightsBetween } from '../db/database';
import { InsightRow } from '../types/models';
import { localDayBounds, toPersianDuration } from '../utils/time';

type Props = { refreshKey: number };
type Range = 'day' | 'week';

export function InsightsScreen({ refreshKey }: Props) {
  const [range, setRange] = useState<Range>('day');
  const [rows, setRows] = useState<InsightRow[]>([]);

  const load = useCallback(async () => {
    const now = new Date();
    const today = localDayBounds(now);
    let start = today.start;
    const end = today.end;
    if (range === 'week') {
      start = new Date(today.start);
      start.setDate(start.getDate() - 6);
    }
    setRows(await getInsightsBetween(start, end));
  }, [range]);

  useEffect(() => { load().catch(console.error); }, [load, refreshKey]);

  const total = useMemo(() => rows.reduce((sum, row) => sum + row.minutes, 0), [rows]);
  let cumulative = 0;

  return (
    <ScreenShell title="گزارش" subtitle="ببین زمان واقعاً کجا مصرف شده؛ ابتدا فقط داده، بعد تصمیم ۸۰/۲۰.">
      <View style={styles.segmented}>
        <Pressable onPress={() => setRange('week')} style={[styles.segment, range === 'week' && styles.segmentActive]}>
          <Text style={[styles.segmentText, range === 'week' && styles.segmentTextActive]}>۷ روز</Text>
        </Pressable>
        <Pressable onPress={() => setRange('day')} style={[styles.segment, range === 'day' && styles.segmentActive]}>
          <Text style={[styles.segmentText, range === 'day' && styles.segmentTextActive]}>امروز</Text>
        </Pressable>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>زمان ثبت‌شده</Text>
        <Text style={styles.totalValue}>{toPersianDuration(total)}</Text>
      </View>

      <Text style={styles.heading}>Pareto زمان</Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>هنوز داده‌ای برای این بازه ثبت نشده است.</Text>
      ) : rows.map((row) => {
        const pct = total > 0 ? (row.minutes / total) * 100 : 0;
        cumulative += pct;
        return (
          <View key={row.activity_id} style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={styles.meta}>{toPersianDuration(row.minutes)} · {pct.toFixed(0)}٪ · تجمعی {cumulative.toFixed(0)}٪</Text>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{row.activity_name}</Text>
                <Text style={styles.icon}>{row.activity_icon}</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(2, pct)}%` }]} />
            </View>
          </View>
        );
      })}

      {rows.length > 0 ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>این نسخه فقط «سهم زمان» را نشان می‌دهد. در نسخه بعدی می‌توانیم ارزش، انرژی و رضایت هر فعالیت را اضافه کنیم تا ۸۰/۲۰ واقعی‌تر شود.</Text>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', backgroundColor: '#E8EBEF', borderRadius: 15, padding: 4, marginBottom: 18 },
  segment: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: '#FFFFFF' },
  segmentText: { color: '#6C737D', fontWeight: '700' },
  segmentTextActive: { color: '#171A20', fontWeight: '900' },
  totalCard: { borderRadius: 20, padding: 18, backgroundColor: '#171A20', marginBottom: 24 },
  totalLabel: { color: '#BEC3CB', textAlign: 'right', fontSize: 13 },
  totalValue: { color: '#FFFFFF', textAlign: 'right', fontWeight: '900', fontSize: 28, marginTop: 6 },
  heading: { textAlign: 'right', fontWeight: '900', fontSize: 18, color: '#171A20', marginBottom: 10 },
  row: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DADDE2' },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nameWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flexShrink: 1 },
  icon: { fontSize: 23 },
  name: { textAlign: 'right', color: '#171A20', fontWeight: '800', fontSize: 14, flexShrink: 1 },
  meta: { color: '#6C737D', fontSize: 11, flexShrink: 0 },
  track: { height: 7, marginTop: 9, borderRadius: 99, overflow: 'hidden', backgroundColor: '#E4E7EB' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: '#303640' },
  empty: { textAlign: 'right', color: '#707781', lineHeight: 23, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  note: { marginTop: 20, backgroundColor: '#EEF0F3', borderRadius: 16, padding: 14 },
  noteText: { textAlign: 'right', lineHeight: 22, color: '#59606B', fontSize: 13 },
});
