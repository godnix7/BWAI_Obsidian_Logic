import { Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import {
  LayoutDashboard, FileText, Calendar, User, Shield, ShieldCheck,
  QrCode, Users, Pill, Stethoscope, ClipboardPlus, Clock, Building2,
  TestTube, CreditCard, LogOut, Menu, X
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
    { name: "Emergency Access", path: "/hospital/emergency-access", icon: "QrCode" },
    { name: "Lab Reports", path: "/hospital/lab-reports", icon: "TestTube" },
    { name: "Billing", path: "/hospital/billing", icon: "CreditCard" },
    { name: "Profile", path: "/hospital/profile", icon: "Building2" },
  ]
}
}

const Sidebar = ({ role, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation()
  const { logout } = useAuthStore()
  const items = menus[role] || []

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(10, 17, 40, 0.4)",
            backdropFilter: "blur(4px)", zIndex: 999, animation: "fadeIn 0.3s ease"
          }}
        />
      )}

      <aside style={{
        width: collapsed ? "var(--collapsed-width)" : "var(--sidebar-width)",
        height: "100vh", 
        position: isMobile ? "fixed" : "sticky", 
        top: 0,
        left: isMobile ? (mobileOpen ? 0 : "-100%") : 0,
        zIndex: isMobile ? 1000 : 10,
        background: "var(--glass-medium)", 
        backdropFilter: isMobile ? "none" : "blur(24px)",
        backgroundBlur: isMobile ? "none" : "blur(24px)",
        borderRight: "1px solid var(--border-default)", 
        padding: "24px 12px",
        display: "flex", 
        flexDirection: "column", 
        flexShrink: 0,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
        boxShadow: isMobile && mobileOpen ? "20px 0 50px rgba(0,0,0,0.1)" : "none"
      }}>
        <div style={{ 
          display: "flex", alignItems: "center", justifyContent: (collapsed && !isMobile) ? "center" : "space-between", 
          marginBottom: 32, padding: "0 8px" 
        }}>
          <div style={{ 
            opacity: (collapsed && !isMobile) ? 0 : 1, 
            width: (collapsed && !isMobile) ? 0 : "auto",
            transition: "all 0.3s ease",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
                letterSpacing: "0.02em", color: "var(--eggplant)", margin: 0
              }}>
                MediLocker
              </h2>
            </Link>
          </div>
          
          {isMobile ? (
            <button 
              onClick={() => setMobileOpen(false)}
              style={{
                background: "rgba(10, 17, 40, 0.05)", border: "none",
                borderRadius: "12px", padding: "8px", cursor: "pointer",
                color: "var(--text-primary)"
              }}
            >
              <X size={22} />
            </button>
          ) : (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: "rgba(10, 17, 40, 0.05)", border: "1px solid var(--border-subtle)",
                borderRadius: "12px", padding: "8px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease", color: "var(--text-primary)",
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-light)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(10, 17, 40, 0.05)"}
            >
              <Menu size={22} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ textDecoration: "none" }}
                onClick={() => { if(isMobile) setMobileOpen(false) }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 500,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  borderLeft: (!collapsed || isMobile) && isActive ? "4px solid var(--accent)" : "4px solid transparent",
                  transition: "all 0.2s ease",
                  justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
                  width: "100%"
                }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--glass-light)"; e.currentTarget.style.color = "var(--text-primary)" }}}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)" }}}
                >
                  {Icon && <Icon size={20} style={{ flexShrink: 0 }} />}
                  {(!collapsed || isMobile) && (
                    <span style={{ 
                      whiteSpace: "nowrap", 
                      opacity: (collapsed && !isMobile) ? 0 : 1,
                      transition: "opacity 0.2s ease"
                    }}>
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
          <button onClick={() => { logout(); window.location.href = "/login" }} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            color: "var(--text-secondary)", background: "transparent", border: "none",
            cursor: "pointer", width: "100%", fontFamily: "var(--font-body)",
            transition: "all 0.2s",
            justifyContent: (collapsed && !isMobile) ? "center" : "flex-start"
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.background = "rgba(239,68,68,0.08)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent" }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span style={{ whiteSpace: "nowrap" }}>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
