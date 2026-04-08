import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";
import { AuthScreen } from "../screens/AuthScreen";
import { PatientHomeScreen } from "../screens/patient/PatientHomeScreen";
import { PatientProfileScreen } from "../screens/patient/PatientProfileScreen";
import { FamilyScreen } from "../screens/patient/FamilyScreen";
import { RecordsScreen } from "../screens/patient/RecordsScreen";
import { PatientAppointmentsScreen } from "../screens/patient/PatientAppointmentsScreen";
import { PrescriptionsScreen } from "../screens/patient/PrescriptionsScreen";
import { ConsentsScreen } from "../screens/patient/ConsentsScreen";
import { InsuranceScreen } from "../screens/patient/InsuranceScreen";
import { EmergencyQrScreen } from "../screens/patient/EmergencyQrScreen";
import { DoctorHomeScreen } from "../screens/doctor/DoctorHomeScreen";
import { DoctorAppointmentsScreen } from "../screens/doctor/DoctorAppointmentsScreen";
import { HospitalHomeScreen } from "../screens/hospital/HospitalHomeScreen";

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { user, booting } = useAuth();

  if (booting) {
    return <ActivityIndicator color={colors.accent} style={{ flex: 1 }} size="large" />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.glassHeavy },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : user.role === "patient" ? (
        <>
          <Stack.Screen name="PatientHome" component={PatientHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PatientProfile" component={PatientProfileScreen} options={{ title: "Patient Profile" }} />
          <Stack.Screen name="Family" component={FamilyScreen} options={{ title: "Family Members" }} />
          <Stack.Screen name="Records" component={RecordsScreen} options={{ title: "Medical Records" }} />
          <Stack.Screen name="Appointments" component={PatientAppointmentsScreen} options={{ title: "Appointments" }} />
          <Stack.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ title: "Prescriptions" }} />
          <Stack.Screen name="Consents" component={ConsentsScreen} options={{ title: "Consents" }} />
          <Stack.Screen name="Insurance" component={InsuranceScreen} options={{ title: "Insurance" }} />
          <Stack.Screen name="EmergencyQR" component={EmergencyQrScreen} options={{ title: "Emergency QR" }} />
        </>
      ) : user.role === "doctor" ? (
        <>
          <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} options={{ title: "Doctor Appointments" }} />
        </>
      ) : user.role === "hospital" ? (
        <Stack.Screen name="HospitalHome" component={HospitalHomeScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Fallback" options={{ title: "Unsupported Role" }}>
          {() => <Text>Unsupported role.</Text>}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
