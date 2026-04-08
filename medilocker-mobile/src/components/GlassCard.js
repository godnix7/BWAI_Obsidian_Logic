import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii } from "../theme";

export function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassHeavy,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    shadowColor: "#4A8BDF",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
