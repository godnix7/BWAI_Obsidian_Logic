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

export function InsuranceScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Insurance items will appear here.");
  const [form, setForm] = useState({
    provider_name: "",
    policy_number: "",
    policy_type: "health",
    valid_from: "",
    valid_until: "",
    coverage_amount: "",
    document_url: "",
    is_active: true,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listInsurance(token);
      setItems(data);
      setMessage(`Loaded ${data.length} insurance record(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function add() {
    try {
      await api.addInsurance(token, { ...form, coverage_amount: Number(form.coverage_amount) });
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function remove(id) {
    try {
      await api.deleteInsurance(token, id);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Insurance" subtitle="Manage insurance records available in the patient API.">
      <SectionCard title="Add Insurance">
        <Field label="Provider Name" value={form.provider_name} onChangeText={(provider_name) => setForm({ ...form, provider_name })} />
        <Field label="Policy Number" value={form.policy_number} onChangeText={(policy_number) => setForm({ ...form, policy_number })} />
        <Field label="Policy Type" value={form.policy_type} onChangeText={(policy_type) => setForm({ ...form, policy_type })} />
        <Field label="Valid From" value={form.valid_from} onChangeText={(valid_from) => setForm({ ...form, valid_from })} />
        <Field label="Valid Until" value={form.valid_until} onChangeText={(valid_until) => setForm({ ...form, valid_until })} />
        <Field label="Coverage Amount" value={form.coverage_amount} onChangeText={(coverage_amount) => setForm({ ...form, coverage_amount })} />
        <Field label="Document URL" value={form.document_url} onChangeText={(document_url) => setForm({ ...form, document_url })} />
        <PrimaryButton title="Save Insurance" onPress={add} />
      </SectionCard>

      <SectionCard title="Existing Insurance">
        {items.map((item) => (
          <View key={item.id} style={{ gap: 10 }}>
            <KeyValueRow label={item.provider_name} value={`${item.policy_type} · ${item.policy_number}`} />
            <PrimaryButton title="Delete Insurance" variant="secondary" onPress={() => remove(item.id)} />
          </View>
        ))}
        {!items.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
