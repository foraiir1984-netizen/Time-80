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
import {
  uiIdentifiers,
  type UiActionCode,
} from "./src/components/uiIdentifiers";
import {
  IdentifierTitle,
  IdentifierHeader,
  IdentifierTabLabel,
} from "./src/components/Ui";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect, useState, useRef } from "react";
import {
  AppState,
  Text,
  View,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
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
import {
  theme,
  navigationColors,
  tabVisualOptions,
} from "./src/theme/time80Theme";
import {
  Button,
  Loading,
  ErrorText,
  ui,
  errorMessage,
} from "./src/components/Ui";
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
const stackPageCodes = {
  Main: uiIdentifiers.today.code,
  CheckIn: uiIdentifiers.checkIn.code,
  Backlog: uiIdentifiers.backlog.code,
  SaveResult: uiIdentifiers.saveResult.code,
  NotificationResolution: uiIdentifiers.notificationResolution.code,
  Diagnostics: uiIdentifiers.notificationDiagnostics.code,
};
export function MainTabs() {
  const { fontScale } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const [measurement, setMeasurement] = useState({
    scale: fontScale,
    height: 0,
  });
  const activeScale = useRef(fontScale);
  activeScale.current = fontScale;
  const label =
    (name: string, code: UiActionCode) =>
    ({ color }: { color: string }) => (
      <IdentifierTabLabel
        label={name}
        code={code}
        color={color}
        onLayout={({ nativeEvent }) => {
          if (activeScale.current !== fontScale) return;
          const height = Math.ceil(nativeEvent.layout.height);
          setMeasurement((old) =>
            old.scale === fontScale && old.height >= height
              ? old
              : { scale: fontScale, height },
          );
        }}
      />
    );
  return (
    <Tabs.Navigator
      backBehavior="firstRoute"
      screenOptions={{
        ...tabVisualOptions,
        tabBarAllowFontScaling: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          ...tabVisualOptions.tabBarStyle,
          height:
            40 +
            Math.max(
              48 * fontScale,
              measurement.scale === fontScale ? measurement.height : 0,
            ) +
            insets.bottom,
        },
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            pressOpacity={1}
            pressColor={theme.pressed}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: "امروز",
          tabBarLabel: label("امروز", uiIdentifiers.selectTodayTab.code),
          tabBarIcon: ({ color }) => <AssetIcon color={color} iconKey="home" />,
        }}
      />
      <Tabs.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: "فعالیت‌ها",
          tabBarLabel: label(
            "فعالیت‌ها",
            uiIdentifiers.selectActivitiesTab.code,
          ),
          tabBarIcon: ({ color }) => <AssetIcon color={color} iconKey="grid" />,
        }}
      />
      <Tabs.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: "گزارش",
          tabBarLabel: label("گزارش", uiIdentifiers.selectInsightsTab.code),
          tabBarIcon: ({ color }) => (
            <AssetIcon color={color} iconKey="report" />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "تنظیمات",
          tabBarLabel: label("تنظیمات", uiIdentifiers.selectSettingsTab.code),
          tabBarIcon: ({ color }) => (
            <AssetIcon color={color} iconKey="settings" />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
export default function App() {
  const [navReady, setNavReady] = useState(false);
  const [ready, setReady] = useState(false),
    [onboard, setOnboard] = useState(false),
    [bootstrapError, setBootstrapError] = useState(""),
    [resumeError, setResumeError] = useState(""),
    [attempt, setAttempt] = useState(0);
  const [responseError, setResponseError] = useState(""),
    [retryMessage, setRetryMessage] = useState(""),
    [responseProcessing, setResponseProcessing] = useState(false);
  const resumeVersion = useRef(0),
    retryVersion = useRef(0),
    responseLoadVersion = useRef(0),
    retryRequested = useRef(false),
    latestResponseRun = useRef(0),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      retryVersion.current++;
      responseLoadVersion.current++;
      coordinator.current?.setReady(false);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    async function start() {
      try {
        await initDatabase();
        if (!alive) return;
        const previousTimezone = await getMeta(await db(), "schedule_timezone");
        if (!alive) return;
        if (previousTimezone !== timezone()) await applySettingsPatch({});
        if (!alive) return;
        await ensureSlotHorizon();
        if (!alive) return;
        const completed = await getMeta(await db(), "onboarding_completed");
        if (alive) {
          setBootstrapError("");
          setOnboard(completed === "true");
          setReady(true);
        }
      } catch (e) {
        if (alive) setBootstrapError(errorMessage(e));
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
      const version = ++resumeVersion.current;
      try {
        const previousTimezone = await getMeta(await db(), "schedule_timezone");
        if (!active) return;
        if (previousTimezone !== timezone()) await applySettingsPatch({});
        if (!active) return;
        await ensureSlotHorizon();
        if (!active) return;
        await reconcileNotifications("resume");
        if (active && version === resumeVersion.current) setResumeError("");
      } catch (e) {
        if (active && version === resumeVersion.current)
          setResumeError(errorMessage(e));
      }
    }
    void resume();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") void resume();
    });
    return () => {
      active = false;
      resumeVersion.current++;
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
        if (!mounted.current || !navigation.isReady())
          throw Error("صفحه هنوز آماده نیست");
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
        // Accepted navigation ends feedback belonging to the previous retry view.
        retryVersion.current++;
        retryRequested.current = false;
        setRetryMessage("");
        setResponseProcessing(false);
      },
      dismiss: dismissTappedOccurrence,
      ack: acknowledgeResponse,
      error: (e) => {
        if (mounted.current) setResponseError(errorMessage(e));
      },
      state: (state) => {
        if (!mounted.current || state.runId < latestResponseRun.current) return;
        latestResponseRun.current = state.runId;
        retryVersion.current++;
        responseLoadVersion.current++;
        if (state.status === "processing") {
          setResponseProcessing(true);
          setRetryMessage("");
          return;
        }
        setResponseProcessing(false);
        if (state.status === "success") setResponseError("");
        if (retryRequested.current)
          setRetryMessage(
            state.status === "success"
              ? "پاسخ اعلان پردازش شد."
              : "پردازش پاسخ اعلان کامل نشد؛ دوباره تلاش کنید.",
          );
        retryRequested.current = false;
      },
    });
  function loadPendingResponses() {
    const version = ++responseLoadVersion.current;
    void pendingResponses()
      .then((rows) => {
        if (mounted.current)
          rows.forEach((r) => coordinator.current!.enqueue(r));
      })
      .catch((e) => {
        if (mounted.current && version === responseLoadVersion.current)
          setResponseError(errorMessage(e));
      });
  }
  async function retryResponse() {
    retryRequested.current = true;
    const operation = coordinator.current!.retry();
    const version = ++retryVersion.current;
    const result = await operation;
    if (!mounted.current || version !== retryVersion.current) return;
    // Actual runs report completion through state; immediate results belong to
    // this touch only, and cannot overwrite a newer run or accepted navigation.
    if (result.status === "running")
      setRetryMessage("پردازش پاسخ اعلان در جریان است؛ لطفاً صبر کنید.");
    else if (result.status === "not-ready") {
      retryRequested.current = false;
      setRetryMessage("برنامه هنوز برای بازکردن پاسخ اعلان آماده نیست.");
    } else if (result.status === "empty") {
      retryRequested.current = false;
      setRetryMessage("پاسخ اعلانی برای تلاش دوباره در صف نیست.");
    }
  }
  const responseRetryControls = (
    <>
      <ErrorText error={responseError} />
      {(!!bootstrapError ||
        !!resumeError ||
        !!responseError ||
        !!retryMessage ||
        responseProcessing) && (
        <>
          <Button
            title="تلاش دوباره برای بازکردن اعلان"
            actionCode={uiIdentifiers.retryNotificationResponse.code}
            onPress={() => void retryResponse()}
          />
          {!!(responseProcessing || retryMessage) && (
            <Text style={ui.text} accessibilityLiveRegion="polite">
              {responseProcessing ? "در حال پردازش پاسخ اعلان…" : retryMessage}
            </Text>
          )}
        </>
      )}
    </>
  );
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((r) =>
      coordinator.current!.enqueue(r),
    );
    loadPendingResponses();
    return () => sub.remove();
  }, []);
  useEffect(() => {
    coordinator.current!.setReady(ready && onboard && navReady);
  }, [ready, onboard, navReady]);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={["top", "left", "right"]}
      >
        {!ready ? (
          <View style={[ui.page, { justifyContent: "center" }]}>
            <IdentifierTitle
              title="آماده‌سازی برنامه"
              code={uiIdentifiers.bootstrap.code}
            />
            {bootstrapError || responseError ? (
              <>
                <ErrorText error={bootstrapError} />
                {responseRetryControls}
                <Text style={ui.text}>داده‌ها حذف یا بازنشانی نشده‌اند.</Text>
                {!!bootstrapError && (
                  <Button
                    title="تلاش دوباره"
                    actionCode={uiIdentifiers.retryBootstrap.code}
                    onPress={() => {
                      setAttempt((x) => x + 1);
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <Loading />
                <Text style={ui.text}>آماده‌سازی Time80…</Text>
              </>
            )}
          </View>
        ) : !onboard ? (
          <OnboardingScreen onDone={() => setOnboard(true)} />
        ) : (
          <>
            <ErrorText error={bootstrapError} />
            <ErrorText error={resumeError} />
            {responseRetryControls}
            <NavigationContainer
              ref={navigation}
              theme={{
                ...DefaultTheme,
                colors: { ...DefaultTheme.colors, ...navigationColors },
              }}
              onReady={() => {
                setNavReady(true);
                loadPendingResponses();
              }}
            >
              <Stack.Navigator
                screenOptions={{
                  header: ({ navigation, route, options, back }) => (
                    <IdentifierHeader
                      title={options.title ?? route.name}
                      pageCode={
                        stackPageCodes[
                          route.name as keyof typeof stackPageCodes
                        ]
                      }
                      canGoBack={!!back}
                      onBack={() => navigation.goBack()}
                    />
                  ),
                  headerTitleAlign: "center",
                  headerStyle: { backgroundColor: theme.surface },
                  headerTintColor: theme.accent,
                  headerTitleStyle: { color: theme.text },
                  contentStyle: { backgroundColor: theme.background },
                }}
              >
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
