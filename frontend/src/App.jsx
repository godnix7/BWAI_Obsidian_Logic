import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

// Auth
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"

// Patient
import PatientDashboard from "@/pages/patient/Dashboard"
import PatientRecords from "@/pages/patient/Records"
import PatientAppointments from "@/pages/patient/Appointments"
import PatientPrescriptions from "@/pages/patient/Prescriptions"
import PatientFamily from "@/pages/patient/Family"
import PatientConsents from "@/pages/patient/Consents"
import PatientInsurance from "@/pages/patient/Insurance"
import PatientEmergencyQR from "@/pages/patient/EmergencyQR"
import PatientProfile from "@/pages/patient/Profile"

// Doctor
import DoctorDashboard from "@/pages/doctor/Dashboard"
import DoctorAppointments from "@/pages/doctor/Appointments"
import DoctorPatients from "@/pages/doctor/Patients"
import DoctorPrescriptions from "@/pages/doctor/Prescriptions"
import DoctorSchedule from "@/pages/doctor/Schedule"
import DoctorProfile from "@/pages/doctor/Profile"
import MediLockerPage from "@/pages/MediLockerPage"
import LearnMore from "@/pages/LearnMore"
import PrivacyPolicy from "@/pages/public/PrivacyPolicy"
import TermsOfService from "@/pages/public/TermsOfService"
import Support from "@/pages/public/Support"
import Emergency from "@/pages/public/Emergency"

// Hospital
import HospitalDashboard from "@/pages/hospital/Dashboard"
import HospitalDoctors from "@/pages/hospital/Doctors"
import HospitalPatients from "@/pages/hospital/Patients"
import HospitalLabReports from "@/pages/hospital/LabReports"
import HospitalBilling from "@/pages/hospital/Billing"
import HospitalProfile from "@/pages/hospital/Profile"

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" />
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}`} />
  return children
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<MediLockerPage />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register />} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/records" element={<ProtectedRoute allowedRole="patient"><PatientRecords /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRole="patient"><PatientPrescriptions /></ProtectedRoute>} />
      <Route path="/patient/family" element={<ProtectedRoute allowedRole="patient"><PatientFamily /></ProtectedRoute>} />
      <Route path="/patient/consents" element={<ProtectedRoute allowedRole="patient"><PatientConsents /></ProtectedRoute>} />
      <Route path="/patient/insurance" element={<ProtectedRoute allowedRole="patient"><PatientInsurance /></ProtectedRoute>} />
      <Route path="/patient/emergency-qr" element={<ProtectedRoute allowedRole="patient"><PatientEmergencyQR /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedRole="patient"><PatientProfile /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><DoctorPatients /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRole="doctor"><DoctorPrescriptions /></ProtectedRoute>} />
      <Route path="/doctor/schedule" element={<ProtectedRoute allowedRole="doctor"><DoctorSchedule /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedRole="doctor"><DoctorProfile /></ProtectedRoute>} />

      {/* Hospital */}
      <Route path="/hospital" element={<ProtectedRoute allowedRole="hospital"><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/doctors" element={<ProtectedRoute allowedRole="hospital"><HospitalDoctors /></ProtectedRoute>} />
      <Route path="/hospital/patients" element={<ProtectedRoute allowedRole="hospital"><HospitalPatients /></ProtectedRoute>} />
      <Route path="/hospital/lab-reports" element={<ProtectedRoute allowedRole="hospital"><HospitalLabReports /></ProtectedRoute>} />
      <Route path="/hospital/billing" element={<ProtectedRoute allowedRole="hospital"><HospitalBilling /></ProtectedRoute>} />
      <Route path="/hospital/profile" element={<ProtectedRoute allowedRole="hospital"><HospitalProfile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : "/"} />} />
    </Routes>
  )
}
