import React from "react";
import { Text, Pressable, StyleSheet, View, TextInput } from "react-native";
export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F6F7F9", padding: 18 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  text: { textAlign: "right", fontSize: 15, color: "#17212D", lineHeight: 25 },
  title: {
    fontSize: 23,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 14,
  },
  muted: { textAlign: "right", color: "#667085", lineHeight: 22 },
  error: { color: "#B42318", textAlign: "right", paddingVertical: 10 },
  row: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CDD5DF",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    textAlign: "right",
  },
  button: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#183C43",
    marginVertical: 5,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "700" },
  small: { fontSize: 12, color: "#667085", textAlign: "right" },
});
export function Button({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[ui.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={ui.buttonText}>{title}</Text>
    </Pressable>
  );
}
export function ErrorText({ error }: { error: string }) {
  return error ? (
    <Text accessibilityRole="alert" style={ui.error}>
      {error}
    </Text>
  ) : null;
}
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);
