import React from "react";
import {
  Modal,
  View,
  ScrollView,
  Text,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { uiIdentifiers } from "./uiIdentifiers";
import {
  ui,
  IdentifierTitle,
  IdentifierBadge,
  InteractivePressable,
  Input,
  ErrorText,
} from "./Ui";
import { ReportButton } from "./ReportButton";
import { reportTheme, type ReportTypography } from "../theme/reportTheme";
import { theme } from "../theme/time80Theme";
import type { Query, Mode } from "../utils/reportPeriods";

const labels: Record<Mode, string> = {
  day: "روز",
  week: "هفتهٔ تقویمی",
  month: "ماه تقویمی",
  usage7: "هفتهٔ استفاده",
  usage30: "دورهٔ ۳۰روزهٔ استفاده",
  rolling7: "۷ روز اخیر",
  rolling30: "۳۰ روز اخیر",
  custom: "دلخواه",
};
const modeCodes = {
  day: uiIdentifiers.reportDay.code,
  week: uiIdentifiers.reportCalendarWeek.code,
  month: uiIdentifiers.reportCalendarMonth.code,
  usage7: uiIdentifiers.reportUsageWeek.code,
  usage30: uiIdentifiers.reportUsageMonth.code,
  rolling7: uiIdentifiers.reportRollingWeek.code,
  rolling30: uiIdentifiers.reportRollingMonth.code,
  custom: uiIdentifiers.reportCustomRange.code,
};
export const reportWeekdayNames = [
  "",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];
export function ReportRangeControls({
  q,
  onQueryChange,
  moreOpen,
  onOpenMore,
  onCloseMore,
  a,
  b,
  setA,
  setB,
  error,
  typography,
}: {
  q: Query;
  onQueryChange: (q: Query) => void;
  moreOpen: boolean;
  onOpenMore: () => void;
  onCloseMore: () => void;
  a: string;
  b: string;
  setA: (v: string) => void;
  setB: (v: string) => void;
  error: string;
  typography: ReportTypography;
}) {
  const { height } = useWindowDimensions(),
    insets = useSafeAreaInsets();
  const select = (mode: Mode) => onQueryChange({ ...q, mode, offset: 0 });
  const common = { typography };
  const quickRange =
    (q.mode === "day" && (q.offset === 0 || q.offset === -1)) ||
    ((q.mode === "rolling7" || q.mode === "rolling30") && q.offset === 0);
  return (
    <>
      <View
        style={{
          ...ui.row,
          padding: 8,
          borderRadius: 24,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 24,
          alignItems: "stretch",
        }}
      >
        <ReportButton
          {...common}
          preset
          glyph="calendar"
          title="امروز"
          selected={q.mode === "day" && q.offset === 0}
          actionCode={uiIdentifiers.reportDay.code}
          onPress={() => select("day")}
        />
        <ReportButton
          {...common}
          preset
          glyph="calendar"
          title="روز قبل"
          selected={q.mode === "day" && q.offset === -1}
          actionCode={uiIdentifiers.showPreviousCalendarDay.code}
          onPress={() => onQueryChange({ ...q, mode: "day", offset: -1 })}
        />
        <ReportButton
          {...common}
          preset
          glyph="bars"
          title="۷ روز اخیر"
          selected={q.mode === "rolling7" && q.offset === 0}
          actionCode={uiIdentifiers.reportRollingWeek.code}
          onPress={() => select("rolling7")}
        />
        <ReportButton
          {...common}
          preset
          glyph="calendar"
          title="۳۰ روز اخیر"
          selected={q.mode === "rolling30" && q.offset === 0}
          actionCode={uiIdentifiers.reportRollingMonth.code}
          onPress={() => select("rolling30")}
        />
        <ReportButton
          {...common}
          preset
          glyph="more"
          title="بیشتر"
          selected={moreOpen || !quickRange}
          actionCode={uiIdentifiers.openMoreReports.code}
          onPress={onOpenMore}
        />
      </View>
      {moreOpen && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={onCloseMore}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.scrim,
              justifyContent: "flex-end",
              paddingTop: insets.top,
            }}
          >
            <InteractivePressable
              accessibilityRole="button"
              accessibilityLabel="بستن پنجره بدون انتخاب تازه"
              onPress={onCloseMore}
              preserveCodeContrast
              style={{
                flex: 1,
                minHeight: 48,
                minWidth: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  ...ui.row,
                  backgroundColor: theme.surface,
                  padding: 12,
                  borderRadius: 16,
                }}
              >
                <Text allowFontScaling style={typography.control}>
                  بستن
                </Text>
                <IdentifierBadge
                  code={uiIdentifiers.closeSelectionDialog.code}
                  textStyle={typography.code}
                />
              </View>
            </InteractivePressable>
            <View
              accessibilityViewIsModal
              style={{
                maxHeight: Math.max(48, height - insets.top - 48),
                backgroundColor: theme.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom,
              }}
            >
              <ScrollView
                contentContainerStyle={{ padding: 16, gap: 12 }}
                keyboardShouldPersistTaps="handled"
              >
                <IdentifierTitle
                  title="انتخاب بازه زمانی"
                  code={uiIdentifiers.moreReportsDialog.code}
                  textProps={{ style: typography.sectionTitle }}
                  codeTextStyle={typography.code}
                />
                <ReportButton
                  {...common}
                  title="بستن"
                  actionCode={uiIdentifiers.closeSelectionDialog.code}
                  onPress={onCloseMore}
                />
                {(Object.keys(labels) as Mode[]).map((mode) => (
                  <ReportButton
                    {...common}
                    key={mode}
                    title={labels[mode]}
                    selected={q.mode === mode}
                    actionCode={modeCodes[mode]}
                    onPress={() => select(mode)}
                  />
                ))}
                <Text allowFontScaling style={typography.cardTitle}>
                  جابه‌جایی دوره
                </Text>
                <View style={ui.row}>
                  <ReportButton
                    {...common}
                    title={q.mode === "day" ? "روز قبل" : "قبلی"}
                    actionCode={uiIdentifiers.previousReportPeriod.code}
                    onPress={() =>
                      onQueryChange({ ...q, offset: q.offset - 1 })
                    }
                  />
                  <ReportButton
                    {...common}
                    title={q.mode === "day" ? "امروز" : "دورهٔ جاری"}
                    actionCode={uiIdentifiers.currentReportPeriod.code}
                    onPress={() => onQueryChange({ ...q, offset: 0 })}
                  />
                  <ReportButton
                    {...common}
                    title="بعدی"
                    actionCode={uiIdentifiers.nextReportPeriod.code}
                    disabled={q.offset >= 0}
                    onPress={() =>
                      onQueryChange({ ...q, offset: q.offset + 1 })
                    }
                  />
                </View>
                <Text allowFontScaling style={typography.cardTitle}>
                  تنظیمات گزارش
                </Text>
                <ReportButton
                  {...common}
                  title={
                    q.calendar === "persian" ? "تقویم: شمسی" : "تقویم: میلادی"
                  }
                  actionCode={uiIdentifiers.toggleReportCalendar.code}
                  onPress={() =>
                    onQueryChange({
                      ...q,
                      calendar:
                        q.calendar === "persian" ? "gregory" : "persian",
                    })
                  }
                />
                <ReportButton
                  {...common}
                  title={`شروع هفته: ${reportWeekdayNames[q.weekStart]}`}
                  actionCode={uiIdentifiers.changeReportWeekStart.code}
                  onPress={() =>
                    onQueryChange({ ...q, weekStart: (q.weekStart % 7) + 1 })
                  }
                />
                {q.mode === "custom" && (
                  <>
                    <Text allowFontScaling style={typography.secondary}>
                      تاریخ میلادی YYYY-MM-DD؛ روز پایان نیز شامل می‌شود.
                    </Text>
                    <Input
                      style={{
                        ...typography.body,
                        minHeight: 48,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        writingDirection: "ltr",
                      }}
                      labelStyle={typography.body}
                      codeTextStyle={typography.code}
                      value={a}
                      onChangeText={setA}
                      accessibilityLabel="تاریخ شروع گزارش"
                      actionCode={uiIdentifiers.editCustomReportStart.code}
                      placeholder="شروع"
                    />
                    <Input
                      style={{
                        ...typography.body,
                        minHeight: 48,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        writingDirection: "ltr",
                      }}
                      labelStyle={typography.body}
                      codeTextStyle={typography.code}
                      value={b}
                      onChangeText={setB}
                      accessibilityLabel="تاریخ پایان گزارش"
                      actionCode={uiIdentifiers.editCustomReportEnd.code}
                      placeholder="پایان"
                    />
                    <ErrorText
                      error={error}
                      textStyle={{ ...typography.body, color: theme.danger }}
                    />
                    <ReportButton
                      {...common}
                      variant="primary"
                      title="نمایش بازه"
                      actionCode={uiIdentifiers.applyCustomReportDates.code}
                      onPress={() =>
                        onQueryChange({ ...q, customStart: a, customEnd: b })
                      }
                    />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
