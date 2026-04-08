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

export function PatientAppointmentsScreen() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("Appointments will appear here.");
  const [form, setForm] = useState({
    doctor_id: "",
    hospital_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "30",
    reason: "",
    type: "in_person",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listAppointments(token);
      setAppointments(data);
      setMessage(`Loaded ${data.length} appointment(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function book() {
    try {
      await api.bookAppointment(token, { ...form, duration_minutes: Number(form.duration_minutes) });
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function cancel(id) {
    try {
      await api.cancelAppointment(token, id);
      await load();
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Appointments" subtitle="Book and manage appointments with the current patient endpoints.">
      <SectionCard title="Book Appointment">
        <Field label="Doctor ID" value={form.doctor_id} onChangeText={(doctor_id) => setForm({ ...form, doctor_id })} />
        <Field label="Hospital ID" value={form.hospital_id} onChangeText={(hospital_id) => setForm({ ...form, hospital_id })} />
        <Field label="Appointment Date" value={form.appointment_date} onChangeText={(appointment_date) => setForm({ ...form, appointment_date })} />
        <Field label="Appointment Time" value={form.appointment_time} onChangeText={(appointment_time) => setForm({ ...form, appointment_time })} />
        <Field label="Duration Minutes" value={form.duration_minutes} onChangeText={(duration_minutes) => setForm({ ...form, duration_minutes })} />
        <Field label="Type" value={form.type} onChangeText={(type) => setForm({ ...form, type })} />
        <Field label="Reason" value={form.reason} onChangeText={(reason) => setForm({ ...form, reason })} multiline />
        <PrimaryButton title="Book Appointment" onPress={book} />
      </SectionCard>

      <SectionCard title="Existing Appointments">
        {appointments.map((item) => (
          <View key={item.id} style={{ gap: 10 }}>
            <StatusBadge label={item.status} tone={item.status === "confirmed" ? "success" : item.status === "rejected" ? "error" : "info"} />
            <KeyValueRow label={`${item.appointment_date} ${item.appointment_time}`} value={`${item.type} · ${item.reason || "No reason"}`} />
            <PrimaryButton title="Cancel Appointment" variant="secondary" onPress={() => cancel(item.id)} />
          </View>
        ))}
        {!appointments.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
