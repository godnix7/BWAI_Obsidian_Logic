import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../theme";

export function KeyValueRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radii.md,
    padding: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    gap: spacing.xs,
  },
  label: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: "700" },
  value: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
});
