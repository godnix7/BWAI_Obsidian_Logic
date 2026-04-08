import React, { useEffect, useState } from "react";
import { Image, Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { Field } from "../../components/Field";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { API_PUBLIC_BASE_URL } from "../../config";
import { formatError } from "../../utils";

export function EmergencyQrScreen() {
  const { token } = useAuth();
  const [message, setMessage] = useState("Emergency QR settings will appear here.");
  const [qrUrl, setQrUrl] = useState("");
  const [form, setForm] = useState({
    show_blood_group: "true",
    show_allergies: "true",
    show_emergency_contact: "true",
    show_chronic_conditions: "true",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.getEmergencyQr(token);
      setQrUrl(data.qr_code_url || "");
      setForm({
        show_blood_group: String(data.config?.show_blood_group ?? true),
        show_allergies: String(data.config?.show_allergies ?? true),
        show_emergency_contact: String(data.config?.show_emergency_contact ?? true),
        show_chronic_conditions: String(data.config?.show_chronic_conditions ?? true),
      });
      setMessage("Emergency QR loaded.");
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function save() {
    try {
      await api.updateEmergencyQr(token, {
        show_blood_group: form.show_blood_group === "true",
        show_allergies: form.show_allergies === "true",
        show_emergency_contact: form.show_emergency_contact === "true",
        show_chronic_conditions: form.show_chronic_conditions === "true",
      });
      setMessage("Emergency QR configuration updated.");
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function regenerate() {
    try {
      const data = await api.regenerateEmergencyQr(token);
      setQrUrl(data.qr_code_url || "");
      setMessage("Emergency QR regenerated.");
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Emergency QR" subtitle="Configure and regenerate the emergency QR connected to your profile.">
      <SectionCard title="Visibility Configuration">
        <Field label="Show Blood Group" value={form.show_blood_group} onChangeText={(show_blood_group) => setForm({ ...form, show_blood_group })} />
        <Field label="Show Allergies" value={form.show_allergies} onChangeText={(show_allergies) => setForm({ ...form, show_allergies })} />
        <Field label="Show Emergency Contact" value={form.show_emergency_contact} onChangeText={(show_emergency_contact) => setForm({ ...form, show_emergency_contact })} />
        <Field label="Show Chronic Conditions" value={form.show_chronic_conditions} onChangeText={(show_chronic_conditions) => setForm({ ...form, show_chronic_conditions })} />
        <PrimaryButton title="Save Config" onPress={save} />
        <PrimaryButton title="Regenerate QR" variant="secondary" onPress={regenerate} />
      </SectionCard>

      <SectionCard title="QR Preview">
        {qrUrl ? <Image source={{ uri: `${API_PUBLIC_BASE_URL}${qrUrl}` }} style={{ width: 220, height: 220, alignSelf: "center" }} /> : null}
        <Text>{message}</Text>
      </SectionCard>
    </ScreenShell>
  );
}
