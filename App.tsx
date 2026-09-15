import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { initDatabase } from './src/db/database';
import { checkInPeriodFromNotification } from './src/notifications/scheduler';
import { ActivitiesScreen } from './src/screens/ActivitiesScreen';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { CheckInPeriod } from './src/types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Tab = 'today' | 'activities' | 'insights' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: 'امروز', icon: '◷' },
  { key: 'activities', label: 'فعالیت‌ها', icon: '◉' },
  { key: 'insights', label: 'گزارش', icon: '▥' },
  { key: 'settings', label: 'تنظیمات', icon: '⚙' },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [checkInPeriod, setCheckInPeriod] = useState<CheckInPeriod | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((v) => v + 1), []);

  const consumeNotification = useCallback((response: Notifications.NotificationResponse) => {
    const period = checkInPeriodFromNotification(response.notification);
    if (period) setCheckInPeriod(period);
  }, []);

  useEffect(() => {
    let mounted = true;
    initDatabase()
      .then(async () => {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last && mounted) {
          consumeNotification(last);
          await Notifications.clearLastNotificationResponseAsync();
        }
        if (mounted) setReady(true);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) setReady(true);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      consumeNotification(response);
      Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [consumeNotification]);

  const onCheckInSaved = () => {
    setCheckInPeriod(null);
    setTab('today');
    bump();
  };

  if (!ready) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loading}>
          <StatusBar style="auto" />
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>در حال آماده‌سازی Time80…</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="auto" />
        {checkInPeriod ? (
          <CheckInScreen
            period={checkInPeriod}
            onCancel={() => setCheckInPeriod(null)}
            onSaved={onCheckInSaved}
          />
        ) : (
          <>
            <View style={styles.content}>
              {tab === 'today' ? <TodayScreen refreshKey={refreshKey} onOpenCheckIn={setCheckInPeriod} /> : null}
              {tab === 'activities' ? <ActivitiesScreen onChanged={bump} /> : null}
              {tab === 'insights' ? <InsightsScreen refreshKey={refreshKey} /> : null}
              {tab === 'settings' ? <SettingsScreen onChanged={bump} /> : null}
            </View>
            <View style={styles.nav}>
              {TABS.map((item) => {
                const active = tab === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setTab(item.key)}
                    style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.navPressed]}
                  >
                    <Text style={[styles.navIcon, active && styles.navTextActive]}>{item.icon}</Text>
                    <Text style={[styles.navLabel, active && styles.navTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F7F9' },
  content: { flex: 1 },
  loading: { flex: 1, backgroundColor: '#F6F7F9', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#626A75', fontSize: 14 },
  nav: {
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8DCE2',
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 6,
    flexDirection: 'row-reverse',
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navItemActive: { backgroundColor: '#EEF0F3' },
  navPressed: { opacity: 0.55 },
  navIcon: { fontSize: 20, color: '#7B828D', fontWeight: '700' },
  navLabel: { fontSize: 11, color: '#747B85', fontWeight: '700' },
  navTextActive: { color: '#171A20' },
});
