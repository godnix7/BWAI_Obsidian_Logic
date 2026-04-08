import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "../../components/ScreenShell";
import { SectionCard } from "../../components/SectionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing } from "../../theme";

export function PatientHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <ScreenShell
      title="Patient Mobile Hub"
      subtitle="Every patient feature currently exposed by the backend is available from here."
      right={<PrimaryButton title="Logout" variant="secondary" onPress={logout} />}
    >
      <SectionCard title="Signed in" subtitle="Your mobile session is connected to the backend.">
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>Role: {user?.role}</Text>
      </SectionCard>

      <SectionCard title="Patient Features" subtitle="Open a screen to manage that part of the account.">
        <View style={styles.grid}>
          <PrimaryButton title="Profile" onPress={() => navigation.navigate("PatientProfile")} />
          <PrimaryButton title="Family" onPress={() => navigation.navigate("Family")} />
          <PrimaryButton title="Records" onPress={() => navigation.navigate("Records")} />
          <PrimaryButton title="Appointments" onPress={() => navigation.navigate("Appointments")} />
          <PrimaryButton title="Prescriptions" onPress={() => navigation.navigate("Prescriptions")} />
          <PrimaryButton title="Consents" onPress={() => navigation.navigate("Consents")} />
          <PrimaryButton title="Insurance" onPress={() => navigation.navigate("Insurance")} />
          <PrimaryButton title="Emergency QR" onPress={() => navigation.navigate("EmergencyQR")} />
        </View>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textSecondary, fontSize: 15 },
  grid: { gap: spacing.md },
});
