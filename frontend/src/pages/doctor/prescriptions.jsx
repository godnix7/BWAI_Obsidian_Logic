import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockPrescriptions, mockPatients } from "@/data/mockData"
import { ClipboardPlus, Plus, Trash2 } from "lucide-react"

const Prescriptions = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [meds, setMeds] = useState([{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  const prescriptions = mockPrescriptions.filter(p => p.doctor_id === "d1")

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  const addMed = () => setMeds(m => [...m, { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  const removeMed = (i) => setMeds(m => m.filter((_, idx) => idx !== i))

  return (
    <DashboardLayout>
      <PageHeader title="Prescriptions" description="Create and manage prescriptions">
        <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Prescription</button>
      </PageHeader>

      {prescriptions.length === 0 ? <EmptyState icon={ClipboardPlus} title="No prescriptions yet" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 600 }}>{rx.diagnosis}</h3>
                    <StatusBadge status={rx.is_active ? "active" : "expired"} />
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Patient: {mockPatients.find(p => p.id === rx.patient_id)?.full_name}</p>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{rx.created_at?.split("T")[0]}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rx.medications.map(m => (
                  <span key={m.id} className="badge badge-accent">{m.medication_name} {m.dosage}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <Modal title="Create Prescription" onClose={() => setCreateOpen(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Patient</label>
                <select className="input">{mockPatients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></div>
              <div><label className="input-label">Valid Until</label><input className="input" type="date" /></div>
            </div>
            <div><label className="input-label">Diagnosis</label><textarea className="input" placeholder="e.g. Hypertensive urgency — BP 160/100" /></div>
            <div><label className="input-label">Notes</label><textarea className="input" placeholder="Additional instructions for the patient..." /></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="input-label" style={{ margin: 0 }}>Medications</p>
              <button className="btn-ghost" onClick={addMed} style={{ fontSize: 13 }}><Plus size={14} /> Add Medication</button>
            </div>

            {meds.map((med, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: "var(--glass-light)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Medication #{i + 1}</span>
                  {meds.length > 1 && <button className="btn-ghost" style={{ padding: 4, color: "var(--error)" }} onClick={() => removeMed(i)}><Trash2 size={14} /></button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
                  <input className="input" placeholder="Medication Name" />
                  <input className="input" placeholder="Dosage" />
                  <input className="input" placeholder="Frequency" />
                  <input className="input" placeholder="Duration" />
                </div>
                <input className="input" placeholder="Instructions (e.g. Take with food)" style={{ marginTop: 8 }} />
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setCreateOpen(false)}>Save Prescription</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Prescriptions
