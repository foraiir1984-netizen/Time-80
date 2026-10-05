import { getDayRemaining } from "../services/dayScopeService";
import { timezone } from "../utils/slots";
import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getBacklog } from "../services/slotService";
import type { Slot } from "../types/domain";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { SlotRow } from "../components/SlotRow";
export function BacklogScreen({ navigation, route }: any) {
  const guard = useRef(false),
    cutoff = useRef(new Date().toISOString());
  const scope = route.params?.dayScope;
  const [count, setCount] = useState<number | null>(null);
  const [items, setItems] = useState<Slot[]>([]),
    [error, setError] = useState(""),
    [more, setMore] = useState(true),
    [loading, setLoading] = useState(false);
  async function load(reset = false) {
    if (guard.current) return;
    guard.current = true;
    if (reset) {
      cutoff.current = new Date().toISOString();
      setCount(null);
      setItems([]);
    }
    setLoading(true);
    try {
      const cursor = reset ? null : (items.at(-1)?.period_start ?? null);
      const result = scope
        ? await getDayRemaining(scope, cutoff.current, cursor)
        : null;
      const rows = result?.items ?? (await getBacklog(new Date(), cursor));
      if (result) setCount(result.count);
      setError("");
      setItems((old) => (reset ? rows : [...old, ...rows]));
      setMore(rows.length === 100);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      guard.current = false;
      setLoading(false);
    }
  }
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [scope]),
  );
  return (
    <View style={ui.page}>
      {scope && (
        <>
          <Text style={ui.title}>
            {scope.localDate} · {scope.timezone}
          </Text>
          <Text style={ui.text}>
            {count === null ? "…" : `${count} بازهٔ سررسیدشده برای همین روز`}
          </Text>
          {timezone() !== scope.timezone && (
            <Text style={ui.muted}>
              مرور با منطقهٔ زمانی {scope.timezone} ادامه پیدا می‌کند.
            </Text>
          )}
        </>
      )}
      <ErrorText error={error} />
      {!!error && (
        <Button title="تلاش دوباره" onPress={() => void load(true)} />
      )}

      <FlatList
        data={items}
        keyExtractor={(s) => String(s.id)}
        onEndReached={() => {
          if (more && !loading) load();
        }}
        ListEmptyComponent={
          loading || error ? null : (
            <Text style={ui.text}>
              {scope
                ? "بازهٔ سررسیدشدهٔ دیگری برای این روز باقی نمانده است."
                : "بازهٔ ثبت‌نشده‌ای وجود ندارد."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <>
            <Text style={ui.muted}>
              {new Date(item.period_start).toLocaleDateString("fa-IR", {
                timeZone: scope?.timezone,
              })}
            </Text>
            <SlotRow
              displayTimezone={scope?.timezone}
              item={{ ...item, slot: item, entry: null }}
              onPress={() =>
                navigation.navigate("CheckIn", {
                  start: item.period_start,
                  end: item.period_end,
                  slotId: item.id,
                  source: "manual",
                  dayScope: scope,
                })
              }
            />
          </>
        )}
      />
    </View>
  );
}
