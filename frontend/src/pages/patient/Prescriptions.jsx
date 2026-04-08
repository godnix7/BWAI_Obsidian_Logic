import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockPrescriptions } from "@/data/mockData"
import { Pill, ChevronDown, ChevronUp } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"

const Prescriptions = () => {
  const [expanded, setExpanded] = useState(null)
  const prescriptions = mockPrescriptions.filter(p => p.patient_id === "p1")

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Prescriptions" description="View prescriptions from your doctors" />

      {prescriptions.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions" description="Your prescriptions will appear here" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 600 }}>{rx.diagnosis}</h3>
                    <StatusBadge status={rx.is_active ? "active" : "inactive"} />
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {rx.doctor?.full_name} · {rx.doctor?.specialization}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 4 }}>
                    Prescribed: {rx.created_at?.split("T")[0]} {rx.valid_until && `· Valid until: ${rx.valid_until}`}
                  </p>
                </div>
                {expanded === rx.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>

              {expanded === rx.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                  {rx.notes && <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, fontStyle: "italic" }}>📝 {rx.notes}</p>}
                  <p className="input-label" style={{ marginBottom: 12 }}>Medications</p>
                  <div style={{ display: "grid", gap: 10 }}>
                    {rx.medications.map(med => (
                      <div key={med.id} style={{
                        padding: 14, borderRadius: 10, background: "var(--glass-light)",
                        border: "1px solid var(--border-subtle)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>{med.medication_name}</span>
                          <span className="badge badge-accent">{med.dosage}</span>
                        </div>
                        <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--text-secondary)" }}>
                          <span>⏰ {med.frequency}</span>
                          <span>📆 {med.duration}</span>
                        </div>
                        {med.instructions && (
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>💊 {med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Prescriptions
