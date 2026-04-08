import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function PrescriptionsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("Prescriptions will appear here.");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.listPrescriptions(token);
      setItems(data);
      setMessage(`Loaded ${data.length} prescription(s).`);
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell title="Prescriptions" subtitle="View prescriptions and medication summaries from the API.">
      <SectionCard title="Prescription List">
        {items.map((item) => (
          <KeyValueRow key={item.id} label={item.diagnosis} value={`${item.is_active ? "Active" : "Inactive"} · ${item.medications?.length || 0} medication(s)`} />
        ))}
        {!items.length ? <Text>{message}</Text> : null}
      </SectionCard>
    </ScreenShell>
  );
}
