import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockPatients, mockConsents, mockRecords } from "@/data/mockData"
import { Users, ChevronDown, ChevronUp, FileText, Eye } from "lucide-react"

const Patients = () => {
  const [expanded, setExpanded] = useState(null)
  const consented = mockConsents.filter(c => c.grantee_user_id === "u2" && c.status === "active")

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="My Patients" description="Patients who have granted you consent access" />

      {consented.length === 0 ? <EmptyState icon={Users} title="No consented patients" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {consented.map(consent => {
            const patient = mockPatients.find(p => p.id === consent.patient_id)
            if (!patient) return null
            const records = mockRecords.filter(r => r.patient_id === consent.patient_id &&
              consent.record_types_allowed.includes(r.record_type))
            const isOpen = expanded === consent.id

            return (
              <div key={consent.id} className="glass-card card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => setExpanded(isOpen ? null : consent.id)}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 600 }}>{patient.full_name}</h3>
                      <StatusBadge status={consent.access_level} />
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                      <span>🩸 {patient.blood_group}</span>
                      <span>📧 {patient.email}</span>
                      {consent.expires_at && <span>⏰ Expires: {consent.expires_at.split("T")[0]}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                      {consent.record_types_allowed.map(t => <StatusBadge key={t} status={t} />)}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>

                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16, padding: 12, background: "var(--glass-light)", borderRadius: 10 }}>
                      <div><span className="input-label">Gender</span><p>{patient.gender}</p></div>
                      <div><span className="input-label">DOB</span><p>{patient.date_of_birth}</p></div>
                      <div><span className="input-label">Allergies</span>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {patient.allergies.length > 0 ? patient.allergies.map(a => <span key={a} className="badge badge-warning">{a}</span>) : <span style={{ color: "var(--text-muted)" }}>None</span>}
                        </div></div>
                    </div>

                    <p className="input-label" style={{ marginBottom: 8 }}>Accessible Records ({records.length})</p>
                    {records.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No records available</p> : (
                      <div style={{ display: "grid", gap: 8 }}>
                        {records.map(rec => (
                          <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, background: "var(--glass-light)", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <FileText size={16} color="var(--text-muted)" />
                              <div>
                                <p style={{ fontWeight: 500, fontSize: 14 }}>{rec.title}</p>
                                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{rec.record_date}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <StatusBadge status={rec.record_type} />
                              <button className="btn-ghost" style={{ padding: 6 }}><Eye size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Patients
