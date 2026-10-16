import { uiIdentifiers } from "../components/uiIdentifiers";
import { IdentifierTitle } from "../components/Ui";
import { TodayOverview } from "../components/TodayOverview";
import React, { useCallback, useState } from "react";
import { AppState, FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { getDayTimeline, ensureSlotHorizon } from "../services/slotService";
import { getSettings } from "../db/database";
import type { AppSettings, SlotView } from "../types/domain";
import { SlotRow } from "../components/SlotRow";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { timezone, zoned } from "../utils/slots";
import {
  reportFontSources,
  reportTypography,
  reportTheme,
} from "../theme/reportTheme";
import { theme } from "../theme/time80Theme";

// Separate presentation copy: X07 continues to select from the service array.
export const timelinePresentation = (items: readonly SlotView[]) =>
  [...items].sort((a, b) => b.period_start.localeCompare(a.period_start));
export function TodayScreen({ navigation }: any) {
  const [items, setItems] = useState<SlotView[]>([]),
    [day, setDay] = useState(new Date()),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [settings, setSettings] = useState<AppSettings | null>(null),
    [zone, setZone] = useState(timezone()),
    [review, setReview] = useState(false),
    [now, setNow] = useState(new Date());
  const [fontReady, fontError] = useFonts(reportFontSources);
  const typography = reportTypography(fontReady);
  useFocusEffect(
    useCallback(() => {
      let alive = true,
        sequence = 0,
        foreground =
          AppState.currentState !== "background" &&
          AppState.currentState !== "inactive";
      let timer: ReturnType<typeof setInterval> | undefined;
      let loadedZone = timezone(),
        loadedDate = zoned(new Date(), loadedZone).toPlainDate().toString();
      const load = async () => {
        const request = ++sequence,
          current = new Date();
        setNow(current);
        setLoading(true);
        try {
          // Preserve horizon maintenance, not a new scheduler/repair operation.
          await ensureSlotHorizon(current);
          if (!alive || request !== sequence) return;
          const readZone = timezone();
          const [rows, s] = await Promise.all([
            getDayTimeline(review ? day : current),
            getSettings(),
          ]);
          if (!alive || request !== sequence) return;
          loadedZone = readZone;
          loadedDate = zoned(current, readZone).toPlainDate().toString();
          setItems(rows);
          setSettings(s);
          setZone(readZone);
          setError("");
          if (!review)
            setDay((d) =>
              d.toDateString() === current.toDateString() ? d : current,
            );
        } catch (e) {
          if (alive && request === sequence) setError(errorMessage(e));
        } finally {
          if (alive && request === sequence) setLoading(false);
        }
      };
      const stop = () => {
        if (timer !== undefined) clearInterval(timer);
        timer = undefined;
      };
      const start = () => {
        stop();
        timer = setInterval(() => {
          const current = new Date();
          setNow(current);
          const currentZone = timezone();
          if (
            currentZone !== loadedZone ||
            zoned(current, currentZone).toPlainDate().toString() !== loadedDate
          )
            void load();
        }, 60000);
      };
      const listener = AppState.addEventListener("change", (state) => {
        if (state === "active" && !foreground) {
          foreground = true;
          void load();
          start();
        } else if (state !== "active") {
          foreground = false;
          ++sequence;
          stop();
        }
      });
      if (foreground) {
        void load();
        start();
      }
      return () => {
        alive = false;
        ++sequence;
        stop();
        listener.remove();
      };
    }, [day, review]),
  );
  const open = (i: SlotView) =>
    navigation.navigate("CheckIn", {
      start: i.period_start,
      end: i.period_end,
      source: "manual",
      slotId: i.slot?.id,
      entryState: i.slot?.state,
    });
  const pending = items.find(
    (i) =>
      !i.entry &&
      i.slot?.state === "pending" &&
      +new Date(i.period_end) <= Date.now(),
  );
  const buttonStyle = { minHeight: 48, minWidth: 48, borderRadius: 16 };
  const timelineControls = (
    <View style={{ marginTop: 12 }}>
      <View style={[ui.row, { marginVertical: 12 }]}>
        <Button
          variant="secondary"
          title="روز قبل"
          actionCode={uiIdentifiers.previousTimelineDay.code}
          style={buttonStyle}
          textStyle={typography.control}
          codeTextStyle={typography.code}
          onPress={() => {
            const d = new Date(day);
            d.setDate(d.getDate() - 1);
            setDay(d);
            setReview(true);
          }}
        />
        <Button
          variant="secondary"
          title="امروز"
          actionCode={uiIdentifiers.currentTimelineDay.code}
          style={buttonStyle}
          textStyle={typography.control}
          codeTextStyle={typography.code}
          onPress={() => setDay(new Date())}
        />
        <Button
          variant="secondary"
          title="روز بعد"
          actionCode={uiIdentifiers.nextTimelineDay.code}
          style={buttonStyle}
          textStyle={typography.control}
          codeTextStyle={typography.code}
          disabled={day.toDateString() === new Date().toDateString()}
          onPress={() => {
            const d = new Date(day);
            d.setDate(d.getDate() + 1);
            setDay(d);
            setReview(true);
          }}
        />
      </View>
      <Text allowFontScaling style={typography.secondary}>
        بازه‌های سررسیدشدهٔ ثبت‌نشده:{" "}
        {items
          .filter(
            (i) =>
              !i.entry &&
              i.slot?.state === "pending" &&
              +new Date(i.period_end) <= +now,
          )
          .length.toLocaleString("fa-IR")}
      </Text>
      <Text allowFontScaling style={typography.secondary}>
        ثبت‌شده:{" "}
        {items
          .filter((i) => i.entry?.status === "logged")
          .length.toLocaleString("fa-IR")}
      </Text>
      {pending && (
        <Button
          title="تکمیل آخرین بازهٔ ثبت‌نشده"
          actionCode={uiIdentifiers.completePendingSlot.code}
          style={buttonStyle}
          textStyle={[typography.control, { color: theme.onAccent }]}
          codeTextStyle={typography.code}
          onPress={() => open(pending)}
        />
      )}
      <Button
        variant="secondary"
        title="بازه‌های ثبت‌نشدهٔ روزهای قبل"
        actionCode={uiIdentifiers.openGeneralBacklog.code}
        style={buttonStyle}
        textStyle={typography.control}
        codeTextStyle={typography.code}
        onPress={() => navigation.navigate("Backlog")}
      />
    </View>
  );
  return (
    <View style={[ui.page, { padding: 16 }]}>
      <FlatList
        data={timelinePresentation(items)}
        keyExtractor={(i) => i.period_start}
        ListHeaderComponent={
          <>
            {!review && (
              <TodayOverview
                showActions={false}
                now={now}
                items={items}
                settings={loading || error ? null : settings}
                displayTimezone={zone}
                fontReady={fontReady}
                pending={pending}
                onDue={() => open(pending!)}
                onReview={() => setReview(true)}
              />
            )}
            {review && (
              <>
                <Button
                  variant="secondary"
                  iconKey="home"
                  title="بازگشت به امروز"
                  actionCode={uiIdentifiers.returnToTodayOverview.code}
                  onPress={() => {
                    setDay(new Date());
                    setReview(false);
                  }}
                  style={buttonStyle}
                  textStyle={typography.control}
                  codeTextStyle={typography.code}
                />
                <IdentifierTitle
                  title="مرور روز / خط زمان"
                  code={uiIdentifiers.dayTimeline.code}
                  textProps={{ style: typography.pageTitle }}
                  codeTextStyle={typography.code}
                />
                <Text allowFontScaling style={typography.secondary}>
                  {day.toLocaleDateString("fa-IR", {
                    timeZone: zone,
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </>
            )}
            {fontError && (
              <Text allowFontScaling style={typography.secondary}>
                فونت بارگذاری نشد؛ متن با فونت دستگاه نمایش داده می‌شود.
              </Text>
            )}
            {loading && (
              <Text allowFontScaling style={typography.secondary}>
                در حال خواندن خط زمان…
              </Text>
            )}
            <ErrorText
              error={error}
              textStyle={[typography.body, { color: theme.danger }]}
            />
            {!!error && !!items.length && (
              <Text allowFontScaling style={typography.secondary}>
                تازه‌سازی ناموفق بود؛ خط زمان قبلی نمایش داده می‌شود.
              </Text>
            )}
            <View
              style={[
                ui.row,
                {
                  marginTop: 12,
                  marginBottom: 8,
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text
                allowFontScaling
                accessibilityRole="header"
                style={typography.sectionTitle}
              >
                خط زمان {review ? "روز انتخاب‌شده" : "امروز"}
              </Text>
              {!review && (
                <Button
                  variant="secondary"
                  title="مرور کامل"
                  actionCode={uiIdentifiers.openTodayTimeline.code}
                  onPress={() => setReview(true)}
                  style={{
                    ...buttonStyle,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginVertical: 0,
                  }}
                  textStyle={typography.control}
                  codeTextStyle={typography.code}
                />
              )}
            </View>
            <Text
              allowFontScaling
              style={[typography.caption, { marginBottom: 8 }]}
            >
              ثبت دستی یا ویرایش: بازهٔ پایان‌یافته را لمس کن.
            </Text>
            {review && timelineControls}
          </>
        }
        ListFooterComponent={!review ? timelineControls : null}
        ListEmptyComponent={
          !loading && !error ? (
            <Text allowFontScaling style={typography.body}>
              برای این روز بازه‌ای وجود ندارد. برای مرور گذشته از روز قبل
              استفاده کن.
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "stretch",
              backgroundColor: theme.surface,
              borderRadius: 16,
              paddingRight: 16,
            }}
          >
            <View
              accessible={false}
              pointerEvents="none"
              style={{ width: 12, alignItems: "center", marginLeft: 12 }}
            >
              <View
                style={{
                  width: 2,
                  flex: 1,
                  backgroundColor: reportTheme.track,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 24,
                  width: index === 0 ? 12 : 8,
                  height: index === 0 ? 12 : 8,
                  borderRadius: 8,
                  backgroundColor:
                    item.entry?.status === "logged"
                      ? reportTheme.active
                      : reportTheme.other,
                }}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <SlotRow
                item={item}
                displayTimezone={zone}
                typography={typography}
                onPress={() => open(item)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
