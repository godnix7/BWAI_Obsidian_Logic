import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "../theme";

export function PrimaryButton({ title, onPress, variant = "primary", disabled = false }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "secondary" ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, variant === "secondary" ? styles.secondaryText : styles.primaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.glassLight, borderWidth: 1, borderColor: colors.borderDefault },
  primaryText: { color: "#FFFFFF" },
  secondaryText: { color: colors.textPrimary },
  text: { fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ translateY: 1 }] },
});
