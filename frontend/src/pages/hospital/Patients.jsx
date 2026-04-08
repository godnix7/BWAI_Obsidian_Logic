import { useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockConsents, mockPatients } from "@/data/mockData"
import { Users, Eye } from "lucide-react"

const Patients = () => {
  const consented = mockConsents.filter(c => c.grantee_user_id === "u3" && c.status === "active")

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Patients" description="Patients who have granted consent to your hospital" />

      {consented.length === 0 ? <EmptyState icon={Users} title="No consented patients" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {consented.map(consent => {
            const patient = mockPatients.find(p => p.id === consent.patient_id)
            if (!patient) return null
            return (
              <div key={consent.id} className="glass-card card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{patient.full_name}</h3>
                    <div style={{ display: "flex", gap: 6 }}>
                      <StatusBadge status={consent.access_level} />
                      <StatusBadge status={consent.status} />
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ padding: 6 }}><Eye size={16} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  <span>🩸 {patient.blood_group}</span>
                  <span>📞 {patient.phone}</span>
                  <span>🎂 {patient.date_of_birth}</span>
                  <span>📧 {patient.email}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {consent.record_types_allowed.map(t => <StatusBadge key={t} status={t} />)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
                  Granted: {consent.granted_at?.split("T")[0]}
                  {consent.expires_at && ` · Expires: ${consent.expires_at.split("T")[0]}`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Patients
