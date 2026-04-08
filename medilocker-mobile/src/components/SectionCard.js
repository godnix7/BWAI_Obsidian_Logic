import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard } from "./GlassCard";
import { colors, spacing } from "../theme";

export function SectionCard({ title, subtitle, children, right }) {
  return (
    <GlassCard>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      <View style={styles.content}>{children}</View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, lineHeight: 20 },
  content: { marginTop: spacing.lg, gap: spacing.md },
});
