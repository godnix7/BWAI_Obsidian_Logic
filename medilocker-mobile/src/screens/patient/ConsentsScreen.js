import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { Field } from "../../components/Field";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function ConsentsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Consent records will appear here.");
  const [form, setForm] = useState({ grantee_user_id: "", grantee_role: "doctor", access_level: "read_only" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listConsents(token);
      setItems(data);
      setMessage(`Loaded ${data.length} consent(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function grant() {
    try {
      await api.grantConsent(token, form);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function revoke(id) {
    try {
      await api.revokeConsent(token, id);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Consents" subtitle="Grant and revoke data-sharing access from mobile.">
      <SectionCard title="Grant Consent">
        <Field label="Grantee User ID" value={form.grantee_user_id} onChangeText={(grantee_user_id) => setForm({ ...form, grantee_user_id })} />
        <Field label="Grantee Role" value={form.grantee_role} onChangeText={(grantee_role) => setForm({ ...form, grantee_role })} />
        <Field label="Access Level" value={form.access_level} onChangeText={(access_level) => setForm({ ...form, access_level })} />
        <PrimaryButton title="Grant Consent" onPress={grant} />
      </SectionCard>

      <SectionCard title="Existing Consents">
        {items.map((item) => (
          <View key={item.id} style={{ gap: 10 }}>
            <KeyValueRow label={item.grantee_role} value={`${item.access_level} · ${item.status}`} />
            <PrimaryButton title="Revoke Consent" variant="secondary" onPress={() => revoke(item.id)} />
          </View>
        ))}
        {!items.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
