import React from "react";
import { View, Text } from "react-native";
import { ui, Button } from "../components/Ui";
export function NotificationResolutionScreen({ route, navigation }: any) {
  return (
    <View style={ui.page}>
      <Text style={ui.title}>بازه مشخص نیست</Text>
      <Text style={ui.text}>
        اطلاعات این اعلان برای تعیین بازه کافی نیست. ثبت زمانی تغییر نکرده است.
      </Text>
      <Text style={ui.muted}>
        {(
          {
            "invalid-payload": "اطلاعات اعلان نامعتبر است",
            "ambiguous-occurrence": "زمان نوبت اعلان مشخص نیست",
            "missing-slot": "بازهٔ مربوط به اعلان در فهرست موجود نیست",
            "future-period": "این بازه هنوز پایان نیافته است",
            "conflicting-fields": "اطلاعات زمان اعلان با هم سازگار نیست",
            "unsupported-version": "نسخهٔ اطلاعات اعلان پشتیبانی نمی‌شود",
          } as Record<string, string>
        )[route.params?.reason] ?? "امکان تعیین بازه فراهم نیست"}
      </Text>
      <Button
        title="انتخاب از بازه‌های سررسیدشده"
        onPress={() => navigation.replace("Backlog")}
      />
      <Button
        title="بازگشت به امروز"
        onPress={() => navigation.navigate("Main", { screen: "Today" })}
      />
    </View>
  );
}
