import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "../theme";

export function Field({ label, multiline = false, style, ...props }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top",
  },
});
