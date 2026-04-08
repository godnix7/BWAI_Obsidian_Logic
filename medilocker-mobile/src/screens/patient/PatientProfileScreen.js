import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { Field } from "../../components/Field";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function PatientProfileScreen() {
  const { token } = useAuth();
  const [message, setMessage] = useState("Load and update your patient profile.");
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.getPatientProfile(token);
      setForm({
        full_name: data.full_name || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        blood_group: data.blood_group || "",
        address: data.address || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: data.emergency_contact_phone || "",
      });
      setMessage("Profile loaded.");
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  async function save() {
    try {
      await api.updatePatientProfile(token, form);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Patient Profile" subtitle="Edit the core profile fields currently supported by the API.">
      <SectionCard title="Profile Details">
        <Field label="Full Name" value={form.full_name} onChangeText={(full_name) => setForm({ ...form, full_name })} />
        <Field label="Date of Birth" value={form.date_of_birth} onChangeText={(date_of_birth) => setForm({ ...form, date_of_birth })} />
        <Field label="Gender" value={form.gender} onChangeText={(gender) => setForm({ ...form, gender })} />
        <Field label="Blood Group" value={form.blood_group} onChangeText={(blood_group) => setForm({ ...form, blood_group })} />
        <Field label="Address" value={form.address} onChangeText={(address) => setForm({ ...form, address })} multiline />
        <Field label="Emergency Contact Name" value={form.emergency_contact_name} onChangeText={(emergency_contact_name) => setForm({ ...form, emergency_contact_name })} />
        <Field label="Emergency Contact Phone" value={form.emergency_contact_phone} onChangeText={(emergency_contact_phone) => setForm({ ...form, emergency_contact_phone })} />
        <PrimaryButton title="Save Profile" onPress={save} />
      </SectionCard>
      <SectionCard title="Status">
        <Text>{message}</Text>
      </SectionCard>
    </ScreenShell>
  );
}
