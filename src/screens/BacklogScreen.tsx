import React, { useState, useCallback } from "react";
import { View, FlatList, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getBacklog } from "../services/slotService";
import type { Slot } from "../types/domain";
import { ui, ErrorText, errorMessage } from "../components/Ui";
import { SlotRow } from "../components/SlotRow";
export function BacklogScreen({ navigation }: any) {
  const [items, setItems] = useState<Slot[]>([]),
    [error, setError] = useState(""),
    [more, setMore] = useState(true),
    [loading, setLoading] = useState(false);
  async function load(reset = false) {
    if (loading) return;
    setLoading(true);
    try {
      const rows = await getBacklog(
        new Date(),
        reset ? null : (items.at(-1)?.period_start ?? null),
      );
      setItems((old) => (reset ? rows : [...old, ...rows]));
      setMore(rows.length === 100);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useFocusEffect(
    useCallback(() => {
      load(true);
    }, []),
  );
  return (
    <View style={ui.page}>
      <ErrorText error={error} />
      <FlatList
        data={items}
        keyExtractor={(s) => String(s.id)}
        onEndReached={() => {
          if (more && !loading) load();
        }}
        ListEmptyComponent={
          <Text style={ui.text}>بازهٔ ثبت‌نشده‌ای وجود ندارد.</Text>
        }
        renderItem={({ item }) => (
          <>
            <Text style={ui.muted}>
              {new Date(item.period_start).toLocaleDateString("fa-IR")}
            </Text>
            <SlotRow
              item={{ ...item, slot: item, entry: null }}
              onPress={() =>
                navigation.navigate("CheckIn", {
                  start: item.period_start,
                  end: item.period_end,
                  slotId: item.id,
                  source: "manual",
                })
              }
            />
          </>
        )}
      />
    </View>
  );
}
