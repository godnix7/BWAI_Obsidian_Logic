import { useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockDoctors, mockBilling, mockConsents } from "@/data/mockData"
import { Stethoscope, Users, CreditCard, IndianRupee, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const doctors = mockDoctors.filter(d => d.hospital_id === "h1")
  const patients = mockConsents.filter(c => c.grantee_user_id === "u3" && c.status === "active")
  const invoices = mockBilling.filter(b => b.hospital_id === "h1")
  const unpaid = invoices.filter(b => b.status === "unpaid")
  const revenue = invoices.filter(b => b.status === "paid").reduce((s, b) => s + b.total_amount, 0)

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Hospital Dashboard" description="Apollo MediCare Hospital — Overview" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <StatCard icon={Stethoscope} label="Active Doctors" value={doctors.filter(d => d.is_available).length} color="var(--accent)" />
        <StatCard icon={Users} label="Consented Patients" value={patients.length} color="var(--violet)" />
        <StatCard icon={CreditCard} label="Pending Invoices" value={unpaid.length} color="var(--warning)" />
        <StatCard icon={IndianRupee} label="Revenue (Paid)" value={`₹${revenue.toLocaleString()}`} color="var(--success)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Doctors */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Doctors</h2>
            <Link to="/hospital/doctors" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>View All <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {doctors.slice(0, 3).map(d => (
              <div key={d.id} className="glass-card card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><p style={{ fontWeight: 600, fontSize: 14 }}>{d.full_name}</p><p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{d.specialization} · {d.department}</p></div>
                <StatusBadge status={d.is_available ? "active" : "inactive"} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>Recent Invoices</h2>
            <Link to="/hospital/billing" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>View All <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invoices.slice(0, 3).map(inv => (
              <div key={inv.id} className="glass-card card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><p style={{ fontWeight: 600, fontSize: 14, fontFamily: "var(--font-mono)" }}>{inv.invoice_number}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{inv.patient?.full_name}</p></div>
                <div style={{ textAlign: "right" }}><p style={{ fontWeight: 600, color: "var(--accent)" }}>₹{inv.total_amount.toLocaleString()}</p>
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
