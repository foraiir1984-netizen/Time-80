import {
  createResponseCoordinator,
  resolveNotificationTarget,
} from "./src/notifications/notificationResponseService";
import {
  pendingResponses,
  acknowledgeResponse,
  dismissTappedOccurrence,
} from "./src/notifications/notificationPlatform";
import { SaveResultScreen } from "./src/screens/SaveResultScreen";
import { NotificationResolutionScreen } from "./src/screens/NotificationResolutionScreen";
import { dayScopeFor } from "./src/services/dayScopeService";
import { AssetIcon } from "./src/components/ActivityIcon";
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, AppState, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  NavigationContainer,
  StackActions,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { initDatabase } from "./src/db/database";
import { db } from "./src/db/connection";
import { getMeta } from "./src/db/metaRepository";
import { ensureSlotHorizon } from "./src/services/slotService";
import { applySettingsPatch } from "./src/services/settingsService";
import { timezone } from "./src/utils/slots";
import { reconcileNotifications } from "./src/notifications/scheduler";
import { TodayScreen } from "./src/screens/TodayScreen";
import { ActivitiesScreen } from "./src/screens/ActivitiesScreen";
import { InsightsScreen } from "./src/screens/InsightsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { CheckInScreen } from "./src/screens/CheckInScreen";
import { BacklogScreen } from "./src/screens/BacklogScreen";
import { NotificationDiagnosticsScreen } from "./src/screens/NotificationDiagnosticsScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { Button, ErrorText, ui, errorMessage } from "./src/components/Ui";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const Stack = createNativeStackNavigator(),
  Tabs = createBottomTabNavigator(),
  navigation = createNavigationContainerRef<any>();
function MainTabs() {
  return (
    <Tabs.Navigator
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: "#21594b",
      }}
    >
      <Tabs.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: "امروز",
          tabBarIcon: () => <AssetIcon iconKey="home" />,
        }}
      />
      <Tabs.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: "فعالیت‌ها",
          tabBarIcon: () => <AssetIcon iconKey="grid" />,
        }}
      />
      <Tabs.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: "گزارش",
          tabBarIcon: () => <AssetIcon iconKey="report" />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "تنظیمات",
          tabBarIcon: () => <AssetIcon iconKey="settings" />,
        }}
      />
    </Tabs.Navigator>
  );
}
export default function App() {
  const [navReady, setNavReady] = useState(false);
  const [ready, setReady] = useState(false),
    [onboard, setOnboard] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    async function start() {
      try {
        await initDatabase();
        if ((await getMeta(await db(), "schedule_timezone")) !== timezone())
          await applySettingsPatch({});
        await ensureSlotHorizon();
        const completed = await getMeta(await db(), "onboarding_completed");
        if (alive) {
          setOnboard(completed === "true");
          setReady(true);
        }
      } catch (e) {
        if (alive) setError(errorMessage(e));
      }
    }
    void start();
    return () => {
      alive = false;
    };
  }, [attempt]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    async function resume() {
      try {
        if ((await getMeta(await db(), "schedule_timezone")) !== timezone())
          await applySettingsPatch({});
        await ensureSlotHorizon();
        await reconcileNotifications("resume");
      } catch (e) {
        if (active) setError(errorMessage(e));
      }
    }
    void resume();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void resume();
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, [ready]);
  const coordinator = useRef<ReturnType<
    typeof createResponseCoordinator
  > | null>(null);
  if (!coordinator.current)
    coordinator.current = createResponseCoordinator({
      resolve: resolveNotificationTarget,
      route: async (result) => {
        if (!navigation.isReady()) throw Error("صفحه هنوز آماده نیست");
        if (result.kind === "resolved")
          navigation.dispatch(
            StackActions.push("CheckIn", {
              start: result.slot.period_start,
              end: result.slot.period_end,
              slotId: result.slot.id,
              source: "notification",
              entryState: result.entryState,
              dayScope: dayScopeFor(result.slot.period_start),
            }),
          );
        else
          navigation.dispatch(
            StackActions.push("NotificationResolution", {
              reason: result.reason,
            }),
          );
      },
      dismiss: dismissTappedOccurrence,
      ack: acknowledgeResponse,
      error: (e) => setError(errorMessage(e)),
    });
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) =>
      coordinator.current!.enqueue(r),
    );
    void pendingResponses()
      .then((rows) => rows.forEach((r) => coordinator.current!.enqueue(r)))
      .catch((e) => setError(errorMessage(e)));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    coordinator.current!.setReady(ready && onboard && navReady);
  }, [ready, onboard, navReady]);
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f6f7f9" }}
        edges={["top", "left", "right"]}
      >
        {!ready ? (
          <View style={[ui.page, { justifyContent: "center" }]}>
            {error ? (
              <>
                <ErrorText error={error} />
                {!!error && (
                  <Button
                    title="تلاش دوباره برای بازکردن اعلان"
                    onPress={() => void coordinator.current!.retry()}
                  />
                )}
                <Text style={ui.text}>داده‌ها حذف یا بازنشانی نشده‌اند.</Text>
                <Button
                  title="تلاش دوباره"
                  onPress={() => {
                    setError("");
                    setAttempt((x) => x + 1);
                  }}
                />
              </>
            ) : (
              <>
                <ActivityIndicator />
                <Text style={ui.text}>آماده‌سازی Time80…</Text>
              </>
            )}
          </View>
        ) : !onboard ? (
          <OnboardingScreen onDone={() => setOnboard(true)} />
        ) : (
          <>
            <ErrorText error={error} />
            {!!error && (
              <Button
                title="تلاش دوباره برای بازکردن اعلان"
                onPress={() => void coordinator.current!.retry()}
              />
            )}
            <NavigationContainer
              ref={navigation}
              onReady={() => {
                setNavReady(true);
                void pendingResponses()
                  .then((rows) =>
                    rows.forEach((r) => coordinator.current!.enqueue(r)),
                  )
                  .catch((e) => setError(errorMessage(e)));
              }}
            >
              <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
                <Stack.Screen
                  name="Main"
                  component={MainTabs}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="CheckIn"
                  component={CheckInScreen}
                  options={{ title: "ثبت بازه" }}
                />
                <Stack.Screen
                  name="Backlog"
                  component={BacklogScreen}
                  options={{ title: "بازه‌های ثبت‌نشده" }}
                />
                <Stack.Screen
                  name="SaveResult"
                  component={SaveResultScreen}
                  options={{ title: "نتیجهٔ ثبت" }}
                />
                <Stack.Screen
                  name="NotificationResolution"
                  component={NotificationResolutionScreen}
                  options={{ title: "بازه مشخص نیست" }}
                />
                <Stack.Screen
                  name="Diagnostics"
                  component={NotificationDiagnosticsScreen}
                  options={{ title: "بررسی اعلان‌ها" }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
