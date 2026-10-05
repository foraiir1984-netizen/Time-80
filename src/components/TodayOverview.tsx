import React from "react";
import { Text, View } from "react-native";
import type { SlotView } from "../types/domain";
import { theme } from "../theme/time80Theme";
import { ActivityIcon } from "./ActivityIcon";
import { Button, ui } from "./Ui";
// Local-day progress is a visual clock only. It never creates/resizes slots or report periods.
export function dayPresentationProgress(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return Math.max(0, Math.min(1, (+now - +start) / (+end - +start)));
}
export function TodayOverview({
  now,
  items,
  next,
  pending,
  onDue,
  onReview,
}: {
  now: Date;
  items: SlotView[];
  next: string;
  pending?: SlotView;
  onDue: () => void;
  onReview: () => void;
}) {
  const current = items.find(
    (i) => +new Date(i.period_start) <= +now && +new Date(i.period_end) > +now,
  );
  const latest = [...items]
    .reverse()
    .find(
      (i) => i.entry?.status === "logged" && +new Date(i.period_end) <= +now,
    );
  const dueCount = items.filter(
    (i) =>
      !i.entry &&
      i.slot?.state === "pending" &&
      +new Date(i.period_end) <= +now,
  ).length;
  const progress = Math.round(dayPresentationProgress(now) * 100);
  return (
    <>
      <Text accessibilityRole="header" style={ui.title}>
        امروز
      </Text>
      <Text style={ui.muted}>
        {now.toLocaleDateString("fa-IR", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </Text>
      <View
        style={[
          ui.card,
          { paddingVertical: 32, marginTop: 16, alignItems: "center" },
        ]}
      >
        <Text style={ui.small}>زمان اکنون</Text>
        <Text
          accessibilityLabel={`زمان اکنون ${now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`}
          style={{
            fontSize: 56,
            lineHeight: 80,
            fontWeight: "600",
            fontVariant: ["tabular-nums"],
            color: theme.text,
            textAlign: "center",
          }}
        >
          {now.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="گذشت روز محلی؛ نمایش زمان"
          accessibilityValue={{ min: 0, max: 100, now: progress }}
          style={{
            width: "100%",
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.border,
            overflow: "hidden",
            marginVertical: 16,
          }}
        >
          <View
            style={{
              height: 8,
              width: `${progress}%`,
              alignSelf: "flex-end",
              borderRadius: 4,
              backgroundColor: theme.accent,
            }}
          />
        </View>
        <Text style={ui.small}>
          {progress.toLocaleString("fa-IR")}٪ از روز گذشته است
        </Text>
      </View>
      <Text style={ui.muted}>یادآوری بعدی: {next}</Text>
      {current && (
        <View style={[ui.card, { marginTop: 12 }]}>
          <Text style={ui.small}>بازهٔ جاری</Text>
          <Text style={ui.text}>
            {new Date(current.period_start).toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            تا{" "}
            {new Date(current.period_end).toLocaleTimeString("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}
      {latest && (
        <View style={[ui.card, ui.row]}>
          <ActivityIcon
            icon={latest.entry!.activity_icon_view}
            legacy={latest.entry!.activity_icon}
          />
          <View style={{ flex: 1 }}>
            <Text style={ui.small}>آخرین بازهٔ تکمیل‌شده</Text>
            <Text style={ui.text}>{latest.entry!.activity_name}</Text>
          </View>
        </View>
      )}
      <Text style={ui.text}>
        بازه‌های سررسیدشدهٔ ثبت‌نشده: {dueCount.toLocaleString("fa-IR")}
      </Text>
      {pending && <Button title="تکمیل آخرین بازهٔ ثبت‌نشده" onPress={onDue} />}
      <Button
        variant="secondary"
        iconKey="report"
        title="مرور امروز / خط زمان"
        onPress={onReview}
      />
    </>
  );
}
