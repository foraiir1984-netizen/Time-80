import { uiIdentifiers } from "../components/uiIdentifiers";
import { IdentifierTitle } from "../components/Ui";
import {
  ReportRangeControls,
  reportWeekdayNames,
} from "../components/ReportRangeControls";
import { ReportActivitySummary } from "../components/ReportActivitySummary";
import { ReportButton } from "../components/ReportButton";
import {
  reportTypography,
  reportFontSources,
  reportTheme,
} from "../theme/reportTheme";
import { useFonts } from "expo-font";
import { theme } from "../theme/time80Theme";
import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, View, Text, AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ui, ErrorText, errorMessage, Loading } from "../components/Ui";
import { getReport } from "../services/reportService";
import type { Query } from "../utils/reportPeriods";
import { db, transaction } from "../db/connection";
import { getMeta, setMeta } from "../db/metaRepository";
import { toPersianDuration } from "../utils/time";
export function InsightsScreen() {
  const [fontsReady, fontError] = useFonts(reportFontSources);
  const typography = reportTypography(fontsReady);
  const [moreOpen, setMoreOpen] = useState(false);
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
  const [resultQuery, setResultQuery] = useState("");
  const [refresh, setRefresh] = useState(0),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setRefresh((v) => v + 1);
    });
    let day = new Date().toDateString();
    const timer = setInterval(() => {
      const next = new Date().toDateString();
      if (next !== day) {
        day = next;
        setRefresh((v) => v + 1);
      }
    }, 30000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [calendar, week] = await Promise.all([
        db().then((tx) => getMeta(tx, "report_calendar")),
        db().then((tx) => getMeta(tx, "report_week_start")),
      ]);
      setQ((v) => ({
        ...v,
        calendar: calendar === "gregory" ? "gregory" : "persian",
        weekStart: Number(week) || 7,
      }));
      setPreferencesReady(true);
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);
  useEffect(() => {
    if (preferencesReady)
      void transaction(async (tx) => {
        await setMeta(tx, "report_calendar", q.calendar);
        await setMeta(tx, "report_week_start", String(q.weekStart));
      }).catch((e) => setError(errorMessage(e)));
  }, [q.calendar, q.weekStart, preferencesReady]);
  useFocusEffect(
    useCallback(() => {
      if (!preferencesReady) return;
      let alive = true;
      setLoading(true);
      setR(null);
      setError("");
      getReport(q)
        .then((v) => {
          if (alive) {
            setR(v);
            setResultQuery(JSON.stringify(q));
            setLoading(false);
            setError("");
          }
        })
        .catch((e) => {
          if (alive) {
            setError(errorMessage(e));
            setLoading(false);
          }
        });
      return () => {
        alive = false;
      };
    }, [q, refresh, preferencesReady]),
  );
  return (
    <ScrollView
      style={ui.screen}
      contentContainerStyle={{
        padding: reportTheme.pagePadding,
        paddingBottom: 32,
      }}
    >
      <IdentifierTitle
        title="گزارش زمان"
        code={uiIdentifiers.timeReport.code}
        textProps={{ style: typography.pageTitle }}
        codeTextStyle={typography.code}
      />
      <ReportRangeControls
        q={q}
        onQueryChange={setQ}
        moreOpen={moreOpen}
        onOpenMore={() => setMoreOpen(true)}
        onCloseMore={() => setMoreOpen(false)}
        a={a}
        b={b}
        setA={setA}
        setB={setB}
        error={error}
        typography={typography}
      />
      {fontError && (
        <ErrorText
          error="فونت گزارش بارگذاری نشد؛ نمایش با فونت گوشی ادامه دارد."
          textStyle={{ ...typography.body, color: theme.danger }}
        />
      )}
      <ErrorText
        error={error}
        textStyle={{ ...typography.body, color: theme.danger }}
      />
      {loading && <Loading label="در حال بارگذاری گزارش" />}
      {!!error && (
        <ReportButton
          typography={typography}
          title="تلاش دوباره"
          actionCode={
            preferencesReady
              ? uiIdentifiers.retryReportRead.code
              : uiIdentifiers.retryReportPreferences.code
          }
          onPress={() =>
            preferencesReady ? setRefresh((v) => v + 1) : void loadPreferences()
          }
        />
      )}

      {r && resultQuery === JSON.stringify(q) && (
        <>
          <View
            style={[
              ui.card,
              { borderRadius: 24, padding: 20, marginBottom: 24 },
            ]}
          >
            <Text
              allowFontScaling
              accessibilityRole="header"
              style={[
                typography.cardTitle,
                { writingDirection: q.calendar === "persian" ? "rtl" : "ltr" },
              ]}
            >
              {new Date(r.range.start).toLocaleDateString(
                q.calendar === "persian" ? "fa-IR" : "en-GB",
                {
                  timeZone: r.range.timezone,
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}{" "}
              تا{" "}
              {new Date(+new Date(r.range.end) - 1).toLocaleDateString(
                q.calendar === "persian" ? "fa-IR" : "en-GB",
                {
                  timeZone: r.range.timezone,
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}{" "}
            </Text>
            <View
              style={{
                ...ui.row,
                marginVertical: 12,
                justifyContent: "space-between",
              }}
            >
              <Text
                allowFontScaling
                style={[typography.caption, { writingDirection: "ltr" }]}
              >
                {r.range.timezone}
              </Text>
              {r.range.partial && (
                <Text allowFontScaling style={typography.caption}>
                  دورهٔ ناقص
                </Text>
              )}
              <ReportButton
                typography={typography}
                glyph="edit"
                title="تغییر بازه"
                actionCode={uiIdentifiers.openMoreReports.code}
                onPress={() => setMoreOpen(true)}
              />
            </View>
            <Text allowFontScaling style={typography.caption}>
              {q.calendar === "persian" ? "تقویم شمسی" : "تقویم میلادی"} · شروع
              هفته: {reportWeekdayNames[q.weekStart]}
            </Text>
            {r.activities.length === 0 && (
              <Text style={typography.body}>
                برای{" "}
                {new Date(r.range.start).toLocaleDateString(
                  q.calendar === "persian" ? "fa-IR" : "en-GB",
                  { timeZone: r.range.timezone },
                )}{" "}
                بازه‌ای ثبت نشده است.
              </Text>
            )}
            <Text
              allowFontScaling
              style={[
                typography.metric,
                { textAlign: "center", marginVertical: 24 },
              ]}
            >
              {toPersianDuration(r.total)}
            </Text>
            <Text style={typography.body}>
              دورهٔ قبل:{" "}
              {r.previousTotal === null
                ? "—"
                : toPersianDuration(r.previousTotal)}{" "}
              · تغییر:{" "}
              {r.changePercent === null
                ? "قابل محاسبه نیست"
                : `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(r.changePercent)}٪`}
            </Text>
            <Text style={typography.body}>
              پوشش ثبت:{" "}
              {r.historicalCoverageUnknown
                ? "بخشی از تاریخچه نامعلوم"
                : r.coverage === null
                  ? "قابل محاسبه نیست"
                  : `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(r.coverage * 100)}٪`}
            </Text>
            <Text style={typography.secondary}>
              ثبت‌نشده: {toPersianDuration(r.pendingMinutes)} · رد شده:{" "}
              {toPersianDuration(r.skippedMinutes)}
            </Text>
          </View>
          <ReportActivitySummary
            activities={r.activities}
            total={r.total}
            typography={typography}
          />
          <Text style={typography.sectionTitle}>روز به روز</Text>
          {r.daily.map(([d, m]) => (
            <Text
              key={d}
              style={[typography.body, ui.card, { borderRadius: 16 }]}
            >
              {new Date(`${d}T12:00:00`).toLocaleDateString("fa-IR", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
              : {toPersianDuration(m)}
            </Text>
          ))}
          {!!r.qualityFlags.length && (
            <Text style={[ui.error, typography.body, { color: theme.danger }]}>
              داده‌های نیازمند بررسی: {r.qualityFlags.length}
            </Text>
          )}
          <Text style={typography.secondary}>
            گزارش سهم زمان است و امتیاز بهره‌وری محسوب نمی‌شود.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
