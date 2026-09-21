import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, View, Text, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { getReport } from "../services/reportService";
import type { Mode, Query } from "../utils/reportPeriods";
import { db, transaction } from "../db/connection";
import { getMeta, setMeta } from "../db/metaRepository";
import { toPersianDuration } from "../utils/time";
const labels: Record<Mode, string> = {
  day: "روز",
  week: "هفتهٔ تقویمی",
  month: "ماه تقویمی",
  usage7: "هفتهٔ استفاده",
  usage30: "دورهٔ ۳۰روزه",
  rolling7: "۷ روز اخیر",
  rolling30: "۳۰ روز اخیر",
  custom: "دلخواه",
};
export function InsightsScreen() {
  const [q, setQ] = useState<Query>({
      mode: "day",
      offset: 0,
      calendar: "persian",
      weekStart: 7,
    }),
    [r, setR] = useState<Awaited<ReturnType<typeof getReport>> | null>(null),
    [error, setError] = useState(""),
    [a, setA] = useState(""),
    [b, setB] = useState("");
  const [preferencesReady, setPreferencesReady] = useState(false);
  useEffect(() => {
    Promise.all([
      db().then((tx) => getMeta(tx, "report_calendar")),
      db().then((tx) => getMeta(tx, "report_week_start")),
    ])
      .then(([calendar, week]) => {
        setQ((v) => ({
          ...v,
          calendar: calendar === "gregory" ? "gregory" : "persian",
          weekStart: Number(week) || 7,
        }));
        setPreferencesReady(true);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(() => {
    if (preferencesReady)
      void transaction(async (tx) => {
        await setMeta(tx, "report_calendar", q.calendar);
        await setMeta(tx, "report_week_start", String(q.weekStart));
      }).catch((e) => setError(errorMessage(e)));
  }, [q.calendar, q.weekStart, preferencesReady]);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getReport(q)
        .then((v) => {
          if (alive) {
            setR(v);
            setError("");
          }
        })
        .catch((e) => alive && setError(errorMessage(e)));
      return () => {
        alive = false;
      };
    }, [q]),
  );
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
      <Text style={ui.title}>گزارش زمان</Text>
      <View style={ui.row}>
        {(Object.keys(labels) as Mode[]).map((mode) => (
          <Button
            key={mode}
            title={`${q.mode === mode ? "✓ " : ""}${labels[mode]}`}
            onPress={() => setQ({ ...q, mode, offset: 0 })}
          />
        ))}
      </View>
      <View style={ui.row}>
        <Button
          title="قبلی"
          onPress={() => setQ({ ...q, offset: q.offset - 1 })}
        />
        <Button title="دورهٔ جاری" onPress={() => setQ({ ...q, offset: 0 })} />
        <Button
          title="بعدی"
          disabled={q.offset >= 0}
          onPress={() => setQ({ ...q, offset: q.offset + 1 })}
        />
      </View>
      <View style={ui.row}>
        <Button
          title={q.calendar === "persian" ? "تقویم: شمسی" : "تقویم: میلادی"}
          onPress={() =>
            setQ({
              ...q,
              calendar: q.calendar === "persian" ? "gregory" : "persian",
            })
          }
        />
        <Button
          title={`شروع هفته: ${["", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"][q.weekStart]}`}
          onPress={() => setQ({ ...q, weekStart: (q.weekStart % 7) + 1 })}
        />
      </View>
      {q.mode === "custom" && (
        <>
          <Text style={ui.muted}>
            تاریخ میلادی YYYY-MM-DD؛ روز پایان نیز شامل می‌شود.
          </Text>
          <TextInput
            style={ui.input}
            value={a}
            onChangeText={setA}
            placeholder="شروع"
          />
          <TextInput
            style={ui.input}
            value={b}
            onChangeText={setB}
            placeholder="پایان"
          />
          <Button
            title="نمایش بازه"
            onPress={() => setQ({ ...q, customStart: a, customEnd: b })}
          />
        </>
      )}
      <ErrorText error={error} />
      {r && (
        <>
          <Text style={ui.muted}>
            {new Date(r.range.start).toLocaleDateString(
              q.calendar === "persian" ? "fa-IR" : "en-GB",
            )}{" "}
            تا{" "}
            {new Date(+new Date(r.range.end) - 1).toLocaleDateString(
              q.calendar === "persian" ? "fa-IR" : "en-GB",
            )}{" "}
            · {r.range.timezone}
            {r.range.partial ? " · دورهٔ ناقص" : ""}
          </Text>
          <Text style={ui.title}>{toPersianDuration(r.total)}</Text>
          <Text style={ui.text}>
            دورهٔ قبل:{" "}
            {r.previousTotal === null
              ? "—"
              : toPersianDuration(r.previousTotal)}{" "}
            · تغییر:{" "}
            {r.changePercent === null
              ? "قابل محاسبه نیست"
              : `${r.changePercent.toFixed(1)}٪`}
          </Text>
          <Text style={ui.text}>
            پوشش ثبت:{" "}
            {r.historicalCoverageUnknown
              ? "بخشی از تاریخچه نامعلوم"
              : r.coverage === null
                ? "قابل محاسبه نیست"
                : `${(r.coverage * 100).toFixed(0)}٪`}
          </Text>
          <Text style={ui.muted}>
            ثبت‌نشده: {toPersianDuration(r.pendingMinutes)} · رد شده:{" "}
            {toPersianDuration(r.skippedMinutes)}
          </Text>
          <Text style={ui.title}>فعالیت‌ها و پارتو</Text>
          {r.activities.map((x, i) => (
            <View key={x.id} style={ui.card}>
              <Text style={ui.text}>
                {x.icon} {x.name} · {toPersianDuration(x.minutes)}
              </Text>
              <Text style={ui.muted}>
                سهم {r.total ? ((x.minutes / r.total) * 100).toFixed(1) : "—"}٪
                · تجمعی{" "}
                {r.total
                  ? (
                      (r.activities
                        .slice(0, i + 1)
                        .reduce((v, a) => v + a.minutes, 0) /
                        r.total) *
                      100
                    ).toFixed(1)
                  : "—"}
                ٪
              </Text>
            </View>
          ))}
          <Text style={ui.title}>دسته‌های ICATUS 2016</Text>
          {r.buckets.map((x) => (
            <Text key={x.code} style={ui.text}>
              {x.title_fa ?? x.title_en}: {toPersianDuration(x.minutes)}
            </Text>
          ))}
          <Text style={ui.text}>
            بدون دسته: {toPersianDuration(r.unmappedMinutes)}
          </Text>
          <Text style={ui.muted}>
            پوشش طبقه‌بندی:{" "}
            {r.classificationCoverage === null
              ? "قابل محاسبه نیست"
              : `${(r.classificationCoverage * 100).toFixed(0)}٪`}
          </Text>
          <Text style={ui.title}>روز به روز</Text>
          {r.daily.map(([d, m]) => (
            <Text key={d} style={ui.text}>
              {new Date(`${d}T12:00:00`).toLocaleDateString("fa-IR", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
              : {toPersianDuration(m)}
            </Text>
          ))}
          {!!r.qualityFlags.length && (
            <Text style={ui.error}>
              داده‌های نیازمند بررسی: {r.qualityFlags.length}
            </Text>
          )}
          <Text style={ui.muted}>
            گزارش سهم زمان است و امتیاز بهره‌وری محسوب نمی‌شود.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
