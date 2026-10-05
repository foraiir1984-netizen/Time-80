import { theme } from "../theme/time80Theme";
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
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.page,
    paddingTop: theme.spacing.page,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 6,
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "right",
  },
});
