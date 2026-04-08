import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import { formatError } from "../../utils";

export function HospitalHomeScreen() {
  const { token, user, logout } = useAuth();
  const [message, setMessage] = useState("Loading hospital information...");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.getHospitalProfile(token);
      setMessage(typeof data === "string" ? data : JSON.stringify(data));
    } catch (error) {
      setMessage(formatError(error));
    }
  }

  return (
    <ScreenShell
      title="Hospital Mobile Hub"
      subtitle="Hospital support matches the currently available backend capability."
      right={<PrimaryButton title="Logout" variant="secondary" onPress={logout} />}
    >
      <SectionCard title="Signed in">
        <Text>{user?.email}</Text>
      </SectionCard>
      <SectionCard title="Hospital Data">
        <Text>{message}</Text>
      </SectionCard>
    </ScreenShell>
  );
}
