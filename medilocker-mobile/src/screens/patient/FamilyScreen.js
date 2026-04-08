import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { Field } from "../../components/Field";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function FamilyScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Family records will appear here.");
  const [form, setForm] = useState({ full_name: "", relationship: "", date_of_birth: "", blood_group: "" });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listFamily(token);
      setItems(data);
      setMessage(`Loaded ${data.length} family member(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function addMember() {
    try {
      await api.addFamily(token, { ...form, allergies: [] });
      setForm({ full_name: "", relationship: "", date_of_birth: "", blood_group: "" });
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Family Members" subtitle="Manage linked family members available in the patient backend.">
      <SectionCard title="Add Family Member">
        <Field label="Full Name" value={form.full_name} onChangeText={(full_name) => setForm({ ...form, full_name })} />
        <Field label="Relationship" value={form.relationship} onChangeText={(relationship) => setForm({ ...form, relationship })} />
        <Field label="Date of Birth" value={form.date_of_birth} onChangeText={(date_of_birth) => setForm({ ...form, date_of_birth })} />
        <Field label="Blood Group" value={form.blood_group} onChangeText={(blood_group) => setForm({ ...form, blood_group })} />
        <PrimaryButton title="Add Member" onPress={addMember} />
      </SectionCard>

      <SectionCard title="Existing Members">
        {items.map((item) => (
          <KeyValueRow key={item.id} label={item.full_name} value={`${item.relationship} · ${item.date_of_birth}`} />
        ))}
        {!items.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
