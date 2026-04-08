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

export function RecordsScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("Records will appear here.");
  const [form, setForm] = useState({
    title: "",
    record_type: "lab_report",
    record_date: "",
    description: "",
    is_emergency_visible: false,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listRecords(token);
      setRecords(data);
      setMessage(`Loaded ${data.length} record(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function upload() {
    try {
      await api.uploadRecord(token, form);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function remove(id) {
    try {
      await api.deleteRecord(token, id);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Medical Records" subtitle="Upload, list, and delete patient records through the existing API.">
      <SectionCard title="Upload Record">
        <Field label="Title" value={form.title} onChangeText={(title) => setForm({ ...form, title })} />
        <Field label="Record Type" value={form.record_type} onChangeText={(record_type) => setForm({ ...form, record_type })} />
        <Field label="Record Date" value={form.record_date} onChangeText={(record_date) => setForm({ ...form, record_date })} />
        <Field label="Description" value={form.description} onChangeText={(description) => setForm({ ...form, description })} multiline />
        <Field label="Emergency Visible (true/false)" value={String(form.is_emergency_visible)} onChangeText={(value) => setForm({ ...form, is_emergency_visible: value === "true" })} />
        <PrimaryButton title="Pick File and Upload" onPress={upload} />
      </SectionCard>

      <SectionCard title="Existing Records">
        {records.map((record) => (
          <View key={record.id} style={{ gap: 10 }}>
            <KeyValueRow label={record.title} value={`${record.record_type} · ${record.record_date}`} />
            <PrimaryButton title="Delete Record" variant="secondary" onPress={() => remove(record.id)} />
          </View>
        ))}
        {!records.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
