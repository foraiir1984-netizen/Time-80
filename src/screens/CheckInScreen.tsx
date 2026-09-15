import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityGrid } from '../components/ActivityGrid';
import { getActivities, saveTimeEntry } from '../db/database';
import { Activity, CheckInPeriod } from '../types/models';
import { formatClock } from '../utils/time';

type Props = {
  period: CheckInPeriod;
  onSaved: () => void;
  onCancel: () => void;
};

export function CheckInScreen({ period, onSaved, onCancel }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActivities().then(setActivities).catch(console.error);
  }, []);

  const choose = async (activity: Activity) => {
    if (saving) return;
    setSaving(true);
    try {
      await saveTimeEntry({
        activityId: activity.id,
        periodStart: period.start,
        periodEnd: period.end,
        source: period.source,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeText}>بعداً</Text>
        </Pressable>
        <Text style={styles.brand}>Time80</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.range}>{formatClock(period.start)} ← {formatClock(period.end)}</Text>
        <Text style={styles.question}>این زمان را بیشتر صرف چه کاری کردی؟</Text>
        <Text style={styles.helper}>یک لمس کافی است؛ همان لحظه ذخیره می‌شود.</Text>
      </View>

      {saving ? (
        <View style={styles.loading}><ActivityIndicator size="large" /></View>
      ) : (
        <ActivityGrid activities={activities} onSelect={choose} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111317',
  },
  closeButton: {
    minHeight: 44,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#EDEFF2',
  },
  closeText: {
    color: '#454B55',
    fontWeight: '700',
  },
  hero: {
    marginTop: 48,
    marginBottom: 28,
    alignItems: 'flex-end',
  },
  range: {
    color: '#5B6270',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  question: {
    color: '#111317',
    fontSize: 27,
    lineHeight: 39,
    fontWeight: '900',
    textAlign: 'right',
  },
  helper: {
    color: '#707681',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  loading: {
    paddingTop: 50,
  },
});
