import React, { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  scroll?: boolean;
}>;

export function ScreenShell({
  title,
  subtitle,
  scroll = true,
  children,
}: Props) {
  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </>
  );

  if (!scroll) return <View style={styles.container}>{content}</View>;
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: "#111317",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 6,
    color: "#6A707A",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
  },
});
