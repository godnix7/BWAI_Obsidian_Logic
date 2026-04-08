import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger } from "@/utils/animations"
import { Stethoscope, Users, CreditCard, IndianRupee, ArrowRight, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { getHospitalDoctors, getInvoices, getReceivedConsents, getHospitalProfile } from "@/api/Hospital.api"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [invoices, setInvoices] = useState([])
  const [consents, setConsents] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [profRes, docRes, invRes, conRes] = await Promise.all([
          getHospitalProfile(),
          getHospitalDoctors(),
          getInvoices(),
          getReceivedConsents()
      ])
      setProfile(profRes.data)
      setDoctors(docRes.data || [])
      setInvoices(invRes.data || [])
      setConsents(conRes.data || [])
    } catch (err) {
      console.error("Dashboard fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const unpaid = invoices.filter(b => b.status === "unpaid")
  const revenue = invoices.filter(b => b.status === "paid").reduce((s, b) => s + (Number(b.total_amount) || 0), 0)

  if (loading) return (
      <DashboardLayout>
           <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Hospital Dashboard" description={`${profile?.hospital_name || "Facility"} — Overview`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard icon={Stethoscope} label="Active Doctors" value={doctors.length} color="var(--accent)" />
        <StatCard icon={Users} label="Auth'd Patients" value={consents.length} color="var(--violet)" />
        <StatCard icon={CreditCard} label="Pending Invoices" value={unpaid.length} color="var(--warning)" />
        <StatCard icon={IndianRupee} label="Net Revenue" value={`₹${revenue.toLocaleString()}`} color="var(--success)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Doctors */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Medical Staff</h2>
            <Link to="/hospital/doctors" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>View All <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {doctors.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, padding: 20, textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>No doctors associated yet.</p> : 
             doctors.slice(0, 4).map(d => (
              <div key={d.id} className="glass-card card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{d.full_name}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{d.specialization} · {d.department}</p>
                </div>
                <StatusBadge status="active" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Recent Ledger</h2>
            <Link to="/hospital/billing" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>View All <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {invoices.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13, padding: 20, textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: 12 }}>No financial records.</p> : 
             invoices.slice(0, 4).map(inv => (
              <div key={inv.id} className="glass-card card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><p style={{ fontWeight: 600, fontSize: 14, fontFamily: "var(--font-mono)" }}>{inv.invoice_number}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{inv.patient?.full_name || `ID: ${inv.patient_id.substring(0,8)}`}</p></div>
                <div style={{ textAlign: "right" }}><p style={{ fontWeight: 600, color: "var(--accent)" }}>₹{Number(inv.total_amount).toLocaleString()}</p>
                  <StatusBadge status={inv.status} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
