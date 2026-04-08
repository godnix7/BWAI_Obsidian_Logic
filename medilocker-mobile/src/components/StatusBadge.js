import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../theme";

export function StatusBadge({ label, tone = "info" }) {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      <Text style={[styles.text, textStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
});

const toneStyles = StyleSheet.create({
  info: { backgroundColor: "rgba(74,139,223,0.12)", borderColor: "rgba(74,139,223,0.22)" },
  success: { backgroundColor: "rgba(0,168,107,0.12)", borderColor: "rgba(0,168,107,0.25)" },
  warning: { backgroundColor: "rgba(217,119,6,0.12)", borderColor: "rgba(217,119,6,0.25)" },
  error: { backgroundColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.25)" },
  muted: { backgroundColor: "rgba(10,17,40,0.06)", borderColor: "rgba(10,17,40,0.08)" },
});

const textStyles = StyleSheet.create({
  info: { color: colors.accentDim },
  success: { color: colors.success },
  warning: { color: colors.warning },
  error: { color: colors.error },
  muted: { color: colors.textSecondary },
});
