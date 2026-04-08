import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { getDoctorAppointments, updateAppointmentStatus } from "@/api/Doctor.api"
import { useAuthStore } from "@/store/authStore"
import { Calendar, Users, ClipboardPlus, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const listRef = useRef(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getDoctorAppointments()
      setAppointments(res.data)
    } catch (err) {
      console.error("Doctor dashboard fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    pageEnter(); 
    fetchData();
    setTimeout(() => {
      cardStagger()
      if (listRef.current) scrollReveal(listRef.current)
    }, 100) 
  }, [])

  const handleAction = async (id, status) => {
    try {
        await updateAppointmentStatus(id, status)
        fetchData() // Refresh
    } catch (err) {
        console.error("Action failed:", err)
        alert("Failed to update appointment status.")
    }
  }

  const pending = appointments.filter(a => a.status === "pending")
  const today = appointments.filter(a => a.status === "confirmed")

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent)" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader title="Doctor Dashboard" description={`Welcome back, ${user?.full_name || "Doctor"}`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard icon={Clock} label="Pending Approvals" value={pending.length} color="var(--warning)" />
        <StatCard icon={Calendar} label="Today's Appointments" value={today.length} color="var(--accent)" />
        <StatCard icon={Users} label="Active Patients" value={0} color="var(--violet)" />
        <StatCard icon={ClipboardPlus} label="Prescriptions Written" value={0} color="var(--success)" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Pending Appointments</h2>
        <Link to="/doctor/appointments" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pending.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            No pending appointments
          </div>
        ) : (
          pending.map(apt => (
            <div key={apt.id} className="glass-card card" style={{ width: "100%" }}>
              <div className="card-inner" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, padding: "24px 32px" }}>
                <div style={{ flex: "1 1 300px" }}>
                  <h3 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)", marginBottom: 8 }}>{apt.patient?.full_name || "Patient"}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 12, lineHeight: 1.5 }}>{apt.reason}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                    <StatusBadge status={apt.type} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      📅 {apt.appointment_date} <span style={{ opacity: 0.3, margin: "0 4px" }}>|</span> 🕐 {apt.appointment_time}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                  <button onClick={() => handleAction(apt.id, "confirmed")} className="btn-primary" style={{ padding: "12px 24px", fontSize: 13 }}>Approve</button>
                  <button onClick={() => handleAction(apt.id, "rejected")} className="btn-danger" style={{ padding: "12px 24px", fontSize: 13 }}>Reject</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
