import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "../components/ScreenShell";
import { GlassCard } from "../components/GlassCard";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";
import { formatError } from "../utils";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("Use your existing MediLocker backend credentials.");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "patient",
    license_number: "",
    specialization: "",
    hospital_name: "",
    registration_number: "",
  });

  async function submit() {
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
        setStatus("Account created. You can now sign in.");
        setMode("login");
      }
    } catch (error) {
      setStatus(formatError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell
      title="Mobile care, same backend."
      subtitle="This app is separate from the current frontend and backend folders, but it uses the same API and role model."
    >
      <GlassCard>
        <View style={styles.tabRow}>
          <PrimaryButton title="Login" variant={mode === "login" ? "primary" : "secondary"} onPress={() => setMode("login")} />
          <PrimaryButton title="Register" variant={mode === "register" ? "primary" : "secondary"} onPress={() => setMode("register")} />
        </View>

        <View style={styles.form}>
          <Field label="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} autoCapitalize="none" />
          <Field label="Password" value={form.password} onChangeText={(password) => setForm({ ...form, password })} secureTextEntry />

          {mode === "register" ? (
            <>
              <Field label="Full Name" value={form.full_name} onChangeText={(full_name) => setForm({ ...form, full_name })} />
              <Field label="Phone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
              <Field label="Role" value={form.role} onChangeText={(role) => setForm({ ...form, role: role.toLowerCase() })} />
              {form.role === "doctor" ? (
                <>
                  <Field label="License Number" value={form.license_number} onChangeText={(license_number) => setForm({ ...form, license_number })} />
                  <Field label="Specialization" value={form.specialization} onChangeText={(specialization) => setForm({ ...form, specialization })} />
                </>
              ) : null}
              {form.role === "hospital" ? (
                <>
                  <Field label="Hospital Name" value={form.hospital_name} onChangeText={(hospital_name) => setForm({ ...form, hospital_name })} />
                  <Field
                    label="Registration Number"
                    value={form.registration_number}
                    onChangeText={(registration_number) => setForm({ ...form, registration_number })}
                  />
                </>
              ) : null}
            </>
          ) : null}

          <PrimaryButton title={busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} onPress={submit} disabled={busy} />
        </View>
      </GlassCard>

      <GlassCard>
        <StatusBadge label={mode} tone="info" />
        <Text style={styles.status}>{status}</Text>
      </GlassCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", gap: spacing.md },
  form: { marginTop: spacing.xl, gap: spacing.lg },
  status: { marginTop: spacing.md, color: colors.textSecondary, lineHeight: 22 },
});
