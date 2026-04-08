import { useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { mockAppointments, mockPrescriptions, mockConsents } from "@/data/mockData"
import { Calendar, Users, ClipboardPlus, Clock, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const appointments = mockAppointments.filter(a => a.doctor_id === "d1")
  const pending = appointments.filter(a => a.status === "pending")
  const today = appointments.filter(a => a.status === "confirmed")
  const patients = mockConsents.filter(c => c.grantee_user_id === "u2" && c.status === "active")
  const prescriptions = mockPrescriptions.filter(p => p.doctor_id === "d1")

  const listRef = useRef(null)

  useEffect(() => { 
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (listRef.current) scrollReveal(listRef.current)
    }, 100) 
  }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Doctor Dashboard" description="Welcome back, Dr. Vikram Mehta" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard icon={Clock} label="Pending Approvals" value={pending.length} color="var(--warning)" />
        <StatCard icon={Calendar} label="Today's Appointments" value={today.length} color="var(--accent)" />
        <StatCard icon={Users} label="Active Patients" value={patients.length} color="var(--violet)" />
        <StatCard icon={ClipboardPlus} label="Prescriptions Written" value={prescriptions.length} color="var(--success)" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Pending Appointments</h2>
        <Link to="/doctor/appointments" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pending.length === 0 && <p style={{ color: "var(--text-muted)", padding: 20 }}>No pending appointments</p>}
      <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pending.length === 0 && <p style={{ color: "var(--text-muted)", padding: 20 }}>No pending appointments</p>}
        {pending.map(apt => (
          <div key={apt.id} className="glass-card card" style={{ width: "100%" }}>
            <div className="card-inner" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "24px 32px" }}>
              <div style={{ flex: "1 1 300px" }}>
                <h3 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)", marginBottom: 8 }}>{apt.patient?.full_name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 12, lineHeight: 1.5 }}>{apt.reason}</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  <StatusBadge status={apt.type} />
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    📅 {apt.appointment_date} <span style={{ opacity: 0.3, margin: "0 4px" }}>|</span> 🕐 {apt.appointment_time}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                <button className="btn-primary" style={{ padding: "12px 24px", fontSize: 13 }}>Approve</button>
                <button className="btn-danger" style={{ padding: "12px 24px", fontSize: 13 }}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
