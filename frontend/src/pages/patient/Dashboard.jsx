import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { getRecords, getAppointments, getPrescriptions, getConsents } from "@/api/Patient.api"
import { useAuthStore } from "@/store/authStore"
import { FileText, Calendar, Pill, Shield, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const { user } = useAuthStore()
  const [data, setData] = useState({
    records: [],
    appointments: [],
    prescriptions: [],
    consents: [],
    loading: true,
    error: null
  })

  const statsRef = useRef(null)
  const apptsRef = useRef(null)
  const recordsRef = useRef(null)

  const fetchData = async () => {
    try {
      const [recRes, apptRes, rxRes, consentRes] = await Promise.allSettled([
        getRecords(),
        getAppointments(),
        getPrescriptions(),
        getConsents()
      ])

      const records = recRes.status === "fulfilled" ? recRes.value.data : []
      const appointments = apptRes.status === "fulfilled" ? apptRes.value.data : []
      const prescriptions = rxRes.status === "fulfilled" ? rxRes.value.data : []
      const consents = consentRes.status === "fulfilled" ? consentRes.value.data : []

      const allFailed = [recRes, apptRes, rxRes, consentRes].every(result => result.status === "rejected")

      setData({
        records,
        appointments,
        prescriptions,
        consents,
        loading: false,
        error: allFailed ? "Failed to load dashboard data. Please check your connection or try again later." : null
      })
    } catch (err) {
      console.error("Dashboard fetch failed:", err)
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Failed to load dashboard data. Please check your connection or try again later." 
      }))
    }
  }

  useEffect(() => { 
    pageEnter(); 
    fetchData();
    setTimeout(() => {
      if (statsRef.current) cardStagger(".stats-card")
      if (apptsRef.current) scrollReveal(apptsRef.current)
      if (recordsRef.current) scrollReveal(recordsRef.current)
    }, 100) 
  }, [])

  if (data.loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent)" />
        </div>
      </DashboardLayout>
    )
  }

  if (data.error) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "70vh", gap: 16 }}>
          <AlertCircle size={64} color="var(--error)" strokeWidth={1} />
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: 400 }}>{data.error}</p>
          <button className="btn-primary" onClick={fetchData} style={{ marginTop: 8 }}>Retry Loading</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader title="Patient Dashboard" description={`Welcome back, ${user?.full_name || "User"}`} />

      <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <Link to="/patient/records" style={{ textDecoration: "none" }}>
          <StatCard className="stats-card" icon={FileText} label="Medical Records" value={data.records.length} color="var(--accent)" />
        </Link>
        <Link to="/patient/appointments" style={{ textDecoration: "none" }}>
          <StatCard className="stats-card" icon={Calendar} label="Appointments" value={data.appointments.length} color="var(--violet)" />
        </Link>
        <Link to="/patient/prescriptions" style={{ textDecoration: "none" }}>
          <StatCard className="stats-card" icon={Pill} label="Active Prescriptions" value={data.prescriptions.filter(p => p.is_active).length} color="var(--warning)" />
        </Link>
        <Link to="/patient/consents" style={{ textDecoration: "none" }}>
          <StatCard className="stats-card" icon={Shield} label="Active Consents" value={data.consents.filter(c => c.status === "active").length} color="var(--success)" />
        </Link>
      </div>

      {/* Recent Appointments */}
      <div ref={apptsRef} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Upcoming Appointments</h2>
          <Link to="/patient/appointments" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {data.appointments.filter(a => ["pending", "confirmed"].includes(a.status)).slice(0, 3).map(apt => (
            <Link key={apt.id} to="/patient/appointments" className="glass-card card" style={{ height: "auto", textDecoration: "none" }}>
              <div className="card-inner">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <p className="font-bold font-display" style={{ color: "var(--text-primary)", fontSize: 17 }}>{apt.doctor?.full_name || "Doctor"}</p>
                  <StatusBadge status={apt.status} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>{apt.doctor?.specialization || "General consultation"}</p>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 12, fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                  <span>📅 {apt.appointment_date}</span>
                  <span>🕐 {apt.appointment_time}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <StatusBadge status={apt.type} />
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 16, lineHeight: 1.6 }}>{apt.reason}</p>
              </div>
            </Link>
          ))}
          {data.appointments.length === 0 && <EmptyState icon={Calendar} title="No upcoming appointments" compact />}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {data.records.slice(0, 4).map(rec => (
            <Link key={rec.id} to="/patient/records" className="glass-card card" style={{ textDecoration: "none" }}>
              <div className="card-inner">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <p className="font-bold font-display" style={{ color: "var(--text-primary)", fontSize: 16, lineHeight: 1.4 }}>{rec.title}</p>
                  <StatusBadge status={rec.record_type} />
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500 }}>{rec.record_date}</p>
              </div>
            </Link>
          ))}
          {data.records.length === 0 && <EmptyState icon={FileText} title="No recent records" compact />}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
