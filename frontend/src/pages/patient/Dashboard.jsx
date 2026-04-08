import { useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { mockRecords, mockAppointments, mockPrescriptions, mockConsents } from "@/data/mockData"
import { FileText, Calendar, Pill, Shield, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const records = mockRecords.filter(r => r.patient_id === "p1")
  const appointments = mockAppointments.filter(a => a.patient_id === "p1")
  const prescriptions = mockPrescriptions.filter(p => p.patient_id === "p1")
  const consents = mockConsents.filter(c => c.patient_id === "p1" && c.status === "active")

  const statsRef = useRef(null)
  const apptsRef = useRef(null)
  const recordsRef = useRef(null)

  useEffect(() => { 
    pageEnter(); 
    setTimeout(() => {
      if (statsRef.current) cardStagger(".stats-card")
      if (apptsRef.current) scrollReveal(apptsRef.current)
      if (recordsRef.current) scrollReveal(recordsRef.current)
    }, 100) 
  }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Patient Dashboard" description="Welcome back, Aarav Sharma" />

      <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard className="stats-card" icon={FileText} label="Medical Records" value={records.length} color="var(--accent)" />
        <StatCard className="stats-card" icon={Calendar} label="Appointments" value={appointments.length} color="var(--violet)" />
        <StatCard className="stats-card" icon={Pill} label="Active Prescriptions" value={prescriptions.filter(p => p.is_active).length} color="var(--warning)" />
        <StatCard className="stats-card" icon={Shield} label="Active Consents" value={consents.length} color="var(--success)" />
      </div>

      {/* Recent Appointments */}
      <div ref={apptsRef} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Upcoming Appointments</h2>
          <Link to="/patient/appointments" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {appointments.filter(a => ["pending", "confirmed"].includes(a.status)).slice(0, 3).map(apt => (
            <div key={apt.id} className="glass-card card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p className="font-bold font-display" style={{ color: "var(--text-primary)", fontSize: 16 }}>{apt.doctor?.full_name}</p>
                <StatusBadge status={apt.status} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>{apt.doctor?.specialization}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                <span>📅 {apt.appointment_date}</span>
                <span>🕐 {apt.appointment_time}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={apt.type} />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 12, lineHeight: 1.5 }}>{apt.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Recent Records</h2>
          <Link to="/patient/records" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {records.slice(0, 4).map(rec => (
            <div key={rec.id} className="glass-card card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p className="font-bold font-display" style={{ color: "var(--text-primary)", fontSize: 15 }}>{rec.title}</p>
                <StatusBadge status={rec.record_type} />
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{rec.record_date}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
