import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import {
  LayoutDashboard, FileText, Calendar, User, Shield, ShieldCheck,
  QrCode, Users, Pill, Stethoscope, ClipboardPlus, Clock, Building2,
  TestTube, CreditCard, LogOut
} from "lucide-react"

const iconMap = {
  LayoutDashboard, FileText, Calendar, User, Shield, ShieldCheck,
  QrCode, Users, Pill, Stethoscope, ClipboardPlus, Clock, Building2,
  TestTube, CreditCard
}

const menus = {
  patient: [
    { name: "Dashboard", path: "/patient", icon: "LayoutDashboard" },
    { name: "Records", path: "/patient/records", icon: "FileText" },
    { name: "Appointments", path: "/patient/appointments", icon: "Calendar" },
    { name: "Prescriptions", path: "/patient/prescriptions", icon: "Pill" },
    { name: "Family", path: "/patient/family", icon: "Users" },
    { name: "Consents", path: "/patient/consents", icon: "Shield" },
    { name: "Insurance", path: "/patient/insurance", icon: "ShieldCheck" },
    { name: "Emergency QR", path: "/patient/emergency-qr", icon: "QrCode" },
    { name: "Profile", path: "/patient/profile", icon: "User" },
  ],
  doctor: [
    { name: "Dashboard", path: "/doctor", icon: "LayoutDashboard" },
    { name: "Appointments", path: "/doctor/appointments", icon: "Calendar" },
    { name: "Patients", path: "/doctor/patients", icon: "Users" },
    { name: "Prescriptions", path: "/doctor/prescriptions", icon: "ClipboardPlus" },
    { name: "Schedule", path: "/doctor/schedule", icon: "Clock" },
    { name: "Profile", path: "/doctor/profile", icon: "User" },
  ],
  hospital: [
    { name: "Dashboard", path: "/hospital", icon: "LayoutDashboard" },
    { name: "Doctors", path: "/hospital/doctors", icon: "Stethoscope" },
    { name: "Patients", path: "/hospital/patients", icon: "Users" },
    { name: "Lab Reports", path: "/hospital/lab-reports", icon: "TestTube" },
    { name: "Billing", path: "/hospital/billing", icon: "CreditCard" },
    { name: "Profile", path: "/hospital/profile", icon: "Building2" },
  ]
}

const Sidebar = ({ role }) => {
  const location = useLocation()
  const { logout } = useAuthStore()
  const items = menus[role] || []

  return (
    <aside style={{
      width: 260, height: "100vh", position: "sticky", top: 0,
      background: "var(--glass-medium)", backdropFilter: "blur(24px)",
      borderRight: "1px solid var(--border-default)", padding: "24px 16px",
      display: "flex", flexDirection: "column", flexShrink: 0
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
          letterSpacing: "0.05em", marginBottom: 32, paddingLeft: 8,
          color: "var(--eggplant)"
        }}>
          MEDI LOCKER
        </h2>
      </Link>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-soft)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--glass-light)"; e.currentTarget.style.color = "var(--text-primary)" }}}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)" }}}
              >
                {Icon && <Icon size={18} />}
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
        <button onClick={() => { logout(); window.location.href = "/login" }} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          color: "var(--text-secondary)", background: "transparent", border: "none",
          cursor: "pointer", width: "100%", fontFamily: "var(--font-body)",
          transition: "all 0.2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.background = "rgba(239,68,68,0.08)" }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent" }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar