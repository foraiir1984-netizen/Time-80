import React, { useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  reportTheme,
  REPORT_SUMMARY_LIMIT,
  type ReportTypography,
} from "../theme/reportTheme";
import { uiIdentifiers } from "./uiIdentifiers";
import { ReportButton } from "./ReportButton";
import { ActivityIcon } from "./ActivityIcon";
import { theme } from "../theme/time80Theme";
import { toPersianDuration } from "../utils/time";
import type { getReport } from "../services/reportService";

type ActivityRow = Awaited<ReturnType<typeof getReport>>["activities"][number];
export function summarizeReportActivities(
  activities: readonly ActivityRow[],
  total: number,
) {
  const main = activities.slice(0, REPORT_SUMMARY_LIMIT);
  const remaining = activities.slice(REPORT_SUMMARY_LIMIT);
  const otherMinutes = remaining.reduce((sum, row) => sum + row.minutes, 0);
  const segments: {
    key: string;
    name: string;
    minutes: number;
    color: string;
    share: number;
  }[] = main.map((row, index) => ({
    key: String(row.id),
    name: row.name,
    minutes: row.minutes,
    color: reportTheme.series[index]!,
    share: total > 0 ? row.minutes / total : 0,
  }));
  if (remaining.length)
    segments.push({
      key: "other",
      name: "سایر",
      minutes: otherMinutes,
      color: reportTheme.other,
      share: total > 0 ? otherMinutes / total : 0,
    });
  return { main, remaining, otherMinutes, segments };
}
export const reportPercent = (minutes: number, total: number) =>
  total > 0
    ? `${new Intl.NumberFormat("fa-IR", { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format((minutes / total) * 100)}٪`
    : "—";
export function ReportActivitySummary({
  activities,
  total,
  typography,
}: {
  activities: readonly ActivityRow[];
  total: number;
  typography: ReportTypography;
}) {
  const [expanded, setExpanded] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const summary = summarizeReportActivities(activities, total);
  const compact =
    width >= 360 && fontScale < 1.5 && toPersianDuration(total).length <= 16;
  const diameter = compact
    ? 128
    : Math.min(200 * Math.max(1, fontScale), Math.max(96, width - 72));
  const radius = 76,
    circumference = 2 * Math.PI * radius;
  let offset = 0;
  const rows: {
    key: string;
    name: string;
    minutes: number;
    color: string;
    cumulativeMinutes?: number;
    activity?: ActivityRow;
  }[] = expanded
    ? activities.map((row, index) => ({
        key: String(row.id),
        name: row.name,
        minutes: row.minutes,
        color: reportTheme.series[index] ?? reportTheme.other,
        cumulativeMinutes: activities
          .slice(0, index + 1)
          .reduce((sum, a) => sum + a.minutes, 0),
        activity: row,
      }))
    : summary.segments;
  return (
    <View
      testID="report-activity-summary"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, minWidth: 96 }}>
          <Text
            allowFontScaling
            accessibilityRole="header"
            style={typography.sectionTitle}
          >
            خلاصه فعالیت‌ها
          </Text>
        </View>
        <ReportButton
          typography={typography}
          style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          contentStyle={{ flexDirection: "column", gap: 0 }}
          title={expanded ? "همهٔ فعالیت‌ها نمایش داده شد" : "مشاهده همه"}
          actionCode={uiIdentifiers.expandAllResultActivities.code}
          disabled={expanded || !activities.length}
          onPress={() => setExpanded(true)}
        />
      </View>
      {total <= 0 && (
        <Text allowFontScaling style={typography.body}>
          برای این بازه زمانی ثبت نشده است.
        </Text>
      )}
      <View
        style={{
          flexDirection: compact ? "row" : "column",
          direction: "ltr",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          testID="activity-share-ring"
          style={{
            width: diameter,
            maxWidth: "100%",
            minHeight: diameter,
            justifyContent: "center",
            paddingHorizontal: diameter * 0.22,
            paddingVertical: diameter * 0.22,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Svg
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              viewBox="16 16 168 168"
              accessible={false}
              pointerEvents="none"
              testID="activity-share-donut"
            >
              <Circle
                cx={100}
                cy={100}
                r={radius}
                fill="none"
                stroke={reportTheme.track}
                strokeWidth={16}
              />
              {summary.segments
                .filter((row) => row.share > 0)
                .map((row) => {
                  const start = offset;
                  offset += row.share * circumference;
                  return (
                    <Circle
                      key={row.key}
                      cx={100}
                      cy={100}
                      r={radius}
                      fill="none"
                      stroke={row.color}
                      strokeWidth={16}
                      strokeDasharray={[
                        row.share * circumference,
                        circumference - row.share * circumference,
                      ]}
                      strokeDashoffset={-start}
                      rotation={-90}
                      origin="100,100"
                    />
                  );
                })}
            </Svg>
          </View>
          <Text
            allowFontScaling
            style={[typography.cardTitle, { textAlign: "center" }]}
          >
            {toPersianDuration(total)}
          </Text>
          <Text
            allowFontScaling
            style={[typography.caption, { textAlign: "center" }]}
          >
            مجموع
          </Text>
        </View>
        <View
          style={{
            flex: compact ? 1 : undefined,
            width: compact ? undefined : "100%",
            minWidth: 0,
          }}
        >
          {summary.segments.map((row) => (
            <View
              key={row.key}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderColor: theme.border,
                gap: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  accessible={false}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor: row.color,
                  }}
                />
                <Text
                  allowFontScaling
                  style={[typography.body, { flex: 1, minWidth: 0 }]}
                >
                  {row.name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row-reverse",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 4,
                }}
              >
                <Text allowFontScaling style={typography.secondary}>
                  {toPersianDuration(row.minutes)}
                </Text>
                <Text
                  allowFontScaling
                  style={[typography.secondary, { writingDirection: "ltr" }]}
                >
                  {reportPercent(row.minutes, total)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      {expanded && (
        <View style={{ marginTop: 16 }}>
          <Text
            allowFontScaling
            accessibilityRole="header"
            style={typography.cardTitle}
          >
            همهٔ فعالیت‌های این بازه
          </Text>
          {rows.map((row) => (
            <View
              key={row.key}
              testID={`report-activity-${row.key}`}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: theme.border,
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  accessible={false}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 8,
                    backgroundColor: row.color,
                  }}
                />
                {row.activity ? (
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      gap: 12,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <ActivityIcon
                      icon={row.activity.icon_view}
                      legacy={row.activity.icon}
                      size={24}
                      presentation={{ containerSize: 40, iconSize: 20 }}
                    />
                    <Text
                      allowFontScaling
                      style={[typography.body, { flex: 1 }]}
                    >
                      {row.name}
                    </Text>
                  </View>
                ) : (
                  <Text allowFontScaling style={[typography.body, { flex: 1 }]}>
                    {row.name}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row-reverse",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <Text allowFontScaling style={typography.secondary}>
                  {toPersianDuration(row.minutes)}
                </Text>
                <Text
                  allowFontScaling
                  style={[typography.secondary, { writingDirection: "ltr" }]}
                >
                  {reportPercent(row.minutes, total)}
                </Text>
              </View>
              {row.cumulativeMinutes !== undefined && (
                <Text allowFontScaling style={typography.secondary}>
                  سهم تا این ردیف: {reportPercent(row.cumulativeMinutes, total)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
