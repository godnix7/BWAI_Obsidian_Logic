import React from "react";
import { Text } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";

export function DoctorHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScreenShell
      title="Doctor Mobile Hub"
      subtitle="The currently available doctor feature is appointment review and status updates."
      right={<PrimaryButton title="Logout" variant="secondary" onPress={logout} />}
    >
      <SectionCard title="Signed in">
        <Text>{user?.email}</Text>
      </SectionCard>
      <SectionCard title="Doctor Features">
        <PrimaryButton title="Manage Appointments" onPress={() => navigation.navigate("DoctorAppointments")} />
      </SectionCard>
    </ScreenShell>
  );
}
