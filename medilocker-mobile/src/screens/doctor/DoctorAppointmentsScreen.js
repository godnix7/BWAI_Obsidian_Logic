import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { Field } from "../../components/Field";
import { PrimaryButton } from "../../components/PrimaryButton";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function DoctorAppointmentsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Doctor appointments will appear here.");
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.getDoctorAppointments(token);
      setItems(data);
      setMessage(`Loaded ${data.length} appointment(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function update(id) {
    try {
      const next = statusMap[id] || "confirmed";
      await api.updateDoctorAppointment(token, id, { status: next, notes: "", rejection_reason: "" });
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Doctor Appointments" subtitle="Update appointment state from your mobile workflow.">
      <SectionCard title="Appointment Queue">
        {items.map((item) => (
          <View key={item.id} style={{ gap: 10 }}>
            <StatusBadge label={item.status} tone={item.status === "completed" ? "success" : item.status === "rejected" ? "error" : "info"} />
            <KeyValueRow label={item.patient?.full_name || "Unknown patient"} value={`${item.appointment_date} ${item.appointment_time} · ${item.type}`} />
            <Field label="Next Status" value={statusMap[item.id] || "confirmed"} onChangeText={(value) => setStatusMap({ ...statusMap, [item.id]: value })} />
            <PrimaryButton title="Update Status" variant="secondary" onPress={() => update(item.id)} />
          </View>
        ))}
        {!items.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
