import { uiIdentifiers } from "./uiIdentifiers";
import { IdentifierTitle } from "./Ui";
import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import type { AppSettings, SlotView } from "../types/domain";
import { theme } from "../theme/time80Theme";
import { reportTypography } from "../theme/reportTheme";
import { Button } from "./Ui";
import { DayPassage } from "./DayPassage";
import { dayPresentationProgress } from "./todayPresentation";
export { dayPresentationProgress } from "./todayPresentation";

export function TodayOverview({
  now,
  items,
  pending,
  onDue,
  onReview,
  settings = null,
  displayTimezone,
  fontReady = false,
}: {
  now: Date;
  items: SlotView[];
  pending?: SlotView;
  onDue: () => void;
  onReview: () => void;
  settings?: Pick<AppSettings, "day_start" | "day_end"> | null;
  displayTimezone?: string;
  fontReady?: boolean;
}) {
  const { fontScale, width } = useWindowDimensions();
  const typography = reportTypography(fontReady);
  const compact = fontScale < 1.5 && width >= 360;
  const progress = dayPresentationProgress(now, settings, displayTimezone);
  const dueCount = items.filter(
    (i) =>
      !i.entry &&
      i.slot?.state === "pending" &&
      +new Date(i.period_end) <= +now,
  ).length;
  return (
    <>
      <View
        testID="today-header"
        style={{
          flexDirection: compact ? "row" : "column",
          direction: "ltr",
          gap: 8,
          alignItems: "stretch",
          marginBottom: 12,
        }}
      >
        <Image
          source={require("../../assets/illustrations/today-mountain-v1.png")}
          accessibilityIgnoresInvertColors
          accessible={false}
          style={{
            flex: compact ? 1 : undefined,
            width: compact ? undefined : "100%",
            height: 144,
            borderRadius: 16,
          }}
          resizeMode="cover"
        />
        <View
          style={{
            flex: compact ? 1 : undefined,
            minWidth: 0,
            backgroundColor: theme.surface,
            padding: 16,
            borderRadius: 16,
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IdentifierTitle
            title="امروز"
            code={uiIdentifiers.today.code}
            textProps={{ style: typography.pageTitle }}
            codeTextStyle={typography.code}
          />
          <Text allowFontScaling style={typography.secondary}>
            {now.toLocaleDateString("fa-IR", {
              timeZone: displayTimezone,
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: theme.surface,
        }}
      >
        <Text
          allowFontScaling
          style={[typography.sectionTitle, { fontSize: 19, lineHeight: 28 }]}
        >
          امروزت را مرور کن
        </Text>
      </View>
      <View style={{ alignItems: "center", marginTop: 24 }}>
        <Text allowFontScaling style={typography.secondary}>
          زمان اکنون
        </Text>
        <Text
          allowFontScaling
          accessibilityLabel={`زمان اکنون ${now.toLocaleTimeString("fa-IR", { timeZone: displayTimezone, hour: "2-digit", minute: "2-digit" })}`}
          style={[
            typography.pageTitle,
            {
              fontSize: 42,
              lineHeight: 50,
              textAlign: "center",
              writingDirection: "ltr",
            },
          ]}
        >
          {now.toLocaleTimeString("fa-IR", {
            timeZone: displayTimezone,
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <DayPassage progress={progress} typography={typography} />
      <Text allowFontScaling style={typography.secondary}>
        بازه‌های سررسیدشدهٔ ثبت‌نشده: {dueCount.toLocaleString("fa-IR")}
      </Text>
      {pending && (
        <Button
          title="تکمیل آخرین بازهٔ ثبت‌نشده"
          actionCode={uiIdentifiers.completePendingSlot.code}
          onPress={onDue}
          style={{ minHeight: 48, minWidth: 48, borderRadius: 16 }}
          textStyle={[typography.control, { color: theme.onAccent }]}
          codeTextStyle={typography.code}
        />
      )}
      <Button
        variant="secondary"
        iconKey="report"
        title="مرور امروز / خط زمان"
        actionCode={uiIdentifiers.openTodayTimeline.code}
        onPress={onReview}
        style={{ minHeight: 48, minWidth: 48, borderRadius: 16 }}
        textStyle={typography.control}
        codeTextStyle={typography.code}
      />
    </>
  );
}
