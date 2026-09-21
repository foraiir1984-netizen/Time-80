import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getActivities, setActivityArchived } from "../db/database";
import type { Activity } from "../types/domain";
import { ui, Button, ErrorText, errorMessage } from "../components/Ui";
import { ActivityEditor } from "../components/ActivityEditor";
export function ActivitiesScreen() {
  const [items, setItems] = useState<Activity[]>([]),
    [edit, setEdit] = useState<Activity | null | undefined>(),
    [error, setError] = useState("");
  const load = () =>
    getActivities(true)
      .then(setItems)
      .catch((e) => setError(errorMessage(e)));
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );
  return (
    <View style={ui.page}>
      <Text style={ui.title}>فعالیت‌ها</Text>
      <ErrorText error={error} />
      <Button title="افزودن فعالیت" onPress={() => setEdit(null)} />
      <FlatList
        data={items}
        keyExtractor={(a) => String(a.id)}
        renderItem={({ item }) => (
          <View style={ui.card}>
            <Text style={ui.text}>
              {item.icon} {item.name}
              {item.is_archived ? " · آرشیوشده" : ""}
            </Text>
            <View style={ui.row}>
              <Button title="ویرایش" onPress={() => setEdit(item)} />
              <Button
                title={item.is_archived ? "بازگردانی" : "آرشیو"}
                onPress={() =>
                  Alert.alert(
                    "تغییر فهرست فعالیت‌ها",
                    "سابقهٔ ثبت‌شده حفظ می‌شود.",
                    [
                      { text: "انصراف" },
                      {
                        text: "تأیید",
                        onPress: () =>
                          setActivityArchived(item.id, !item.is_archived)
                            .then(load)
                            .catch((e) => setError(errorMessage(e))),
                      },
                    ],
                  )
                }
              />
            </View>
          </View>
        )}
      />
      {edit !== undefined && (
        <ActivityEditor
          activity={edit}
          onClose={() => setEdit(undefined)}
          onSaved={() => {
            setEdit(undefined);
            load();
          }}
        />
      )}
    </View>
  );
}
