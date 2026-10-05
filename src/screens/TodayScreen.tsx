import { TodayOverview } from "../components/TodayOverview";
import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getDayTimeline, ensureSlotHorizon } from "../services/slotService";
import type { SlotView } from "../types/domain";
import { SlotRow } from "../components/SlotRow";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { getNextReminder } from "../notifications/scheduler";
export function TodayScreen({ navigation }: any) {
  const [items, setItems] = useState<SlotView[]>([]),
    [day, setDay] = useState(new Date()),
    [error, setError] = useState(""),
    [next, setNext] = useState(""),
    [review, setReview] = useState(false),
    [now, setNow] = useState(new Date());
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const load = () =>
        ensureSlotHorizon()
          .then(() =>
            Promise.all([
              getDayTimeline(review ? day : new Date()),
              getNextReminder(),
            ]),
          )
          .then(([rows, n]) => {
            if (alive) {
              setItems(rows);
              const current = new Date();
              setNow(current);
              if (!review)
                setDay((d) =>
                  d.toDateString() === current.toDateString() ? d : current,
                );
              setNext(
                n
                  ? new Date(n.period_end).toLocaleString("fa-IR")
                  : "یادآوری فعال در دسترس نیست",
              );
            }
          })
          .catch((e) => alive && setError(errorMessage(e)));
      load();
      const timer = setInterval(load, 30000);
      return () => {
        alive = false;
        clearInterval(timer);
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
  return (
    <View style={ui.page}>
      <FlatList
        data={review ? items : []}
        keyExtractor={(i) => i.period_start}
        ListHeaderComponent={
          <>
            {!review && (
              <TodayOverview
                now={now}
                items={items}
                next={next}
                pending={pending}
                onDue={() => open(pending!)}
                onReview={() => setReview(true)}
              />
            )}
            {review && (
              <Button
                variant="secondary"
                iconKey="home"
                title="بازگشت به امروز"
                onPress={() => {
                  setDay(new Date());
                  setReview(false);
                }}
              />
            )}
            {review && (
              <Text style={ui.title}>
                {day.toLocaleDateString("fa-IR", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            )}
            {review && <Text style={ui.muted}>یادآوری بعدی: {next}</Text>}
            <ErrorText error={error} />
            <View style={ui.row}>
              <Button
                variant="secondary"
                title="روز قبل"
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
                onPress={() => setDay(new Date())}
              />
              <Button
                variant="secondary"
                title="روز بعد"
                disabled={day.toDateString() === new Date().toDateString()}
                onPress={() => {
                  const d = new Date(day);
                  d.setDate(d.getDate() + 1);
                  setDay(d);
                  setReview(true);
                }}
              />
            </View>
            <Text style={ui.text}>
              ثبت‌شده:{" "}
              {items.filter((i) => i.entry?.status === "logged").length}
            </Text>
            {review && pending && (
              <Button
                title="تکمیل آخرین بازهٔ ثبت‌نشده"
                onPress={() => open(pending)}
              />
            )}
            <Button
              variant="secondary"
              title="بازه‌های ثبت‌نشدهٔ روزهای قبل"
              onPress={() => navigation.navigate("Backlog")}
            />
          </>
        }
        renderItem={({ item }) => (
          <SlotRow item={item} onPress={() => open(item)} />
        )}
      />
    </View>
  );
}
