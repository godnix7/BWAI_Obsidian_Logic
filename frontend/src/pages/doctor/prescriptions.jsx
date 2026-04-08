import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { ClipboardPlus, Plus, Trash2, Loader2, Pill } from "lucide-react"
import { getIssuedPrescriptions, createPrescription, getDoctorAppointments } from "@/api/Doctor.api"

const Prescriptions = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  
  // New Prescription Form State
  const [form, setForm] = useState({
    patient_id: "",
    appointment_id: null,
    diagnosis: "",
    notes: "",
    valid_until: ""
  })
  const [meds, setMeds] = useState([{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rxRes, apptRes] = await Promise.all([
          getIssuedPrescriptions(),
          getDoctorAppointments()
      ])
      setPrescriptions(rxRes.data)
      setAppointments(apptRes.data)
      // Set default patient if appointments exist
      if (apptRes.data.length > 0 && !form.patient_id) {
          setForm(f => ({ ...f, patient_id: apptRes.data[0].patient_id, appointment_id: apptRes.data[0].id }))
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const addMed = () => setMeds(m => [...m, { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  const removeMed = (i) => setMeds(m => m.filter((_, idx) => idx !== i))
  const updateMed = (idx, key, val) => {
      const newMeds = [...meds]
      newMeds[idx][key] = val
      setMeds(newMeds)
  }

  const handleSubmit = async () => {
      if (!form.patient_id || !form.diagnosis || meds.some(m => !m.medication_name)) {
          return alert("Please fill mandatory fields")
      }

      try {
          setSubmitting(true)
          const payload = {
              ...form,
              medications: meds
          }
          await createPrescription(payload)
          fetchData()
          setCreateOpen(false)
          setMeds([{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
          setForm({ patient_id: "", appointment_id: null, diagnosis: "", notes: "", valid_until: "" })
      } catch (err) {
          alert("Failed to create prescription.")
      } finally {
          setSubmitting(false)
      }
  }

  if (loading) return (
      <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Prescriptions" description="Create and manage prescriptions">
        <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Prescription</button>
      </PageHeader>

      {prescriptions.length === 0 ? <EmptyState icon={ClipboardPlus} title="No prescriptions yet" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 600, color: "var(--accent)" }}>{rx.diagnosis}</h3>
                    <StatusBadge status={new Date(rx.valid_until) >= new Date() ? "active" : "expired"} />
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      Patient ID: <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{rx.patient_id}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{rx.created_at?.split("T")[0]}</span>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>ID: {rx.id.substring(0,8)}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {rx.medications?.map(m => (
                  <div key={m.id} style={{ 
                      padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", 
                      border: "1px solid var(--border-subtle)", display: "flex", alignItems: "start", gap: 10
                  }}>
                    <Pill size={14} style={{ color: "var(--accent)", marginTop: 2 }} />
                    <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{m.medication_name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{m.dosage} · {m.frequency} · {m.duration}</p>
                        {m.instructions && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>"{m.instructions}"</p>}
                    </div>
                  </div>
                ))}
              </div>

              {rx.notes && (
                  <div style={{ marginTop: 16, padding: "8px 12px", borderRadius: 8, background: "var(--glass-light)", fontSize: 12, color: "var(--text-secondary)" }}>
                      <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, display: "block" }}>Notes</label>
                      {rx.notes}
                  </div>
              )}
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <Modal title="Create Prescription" onClose={() => setCreateOpen(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                  <label className="input-label">Patient (Active Appointments)</label>
                  <select className="input" value={form.patient_id} onChange={e => {
                      const appt = appointments.find(a => a.patient_id === e.target.value)
                      setForm({...form, patient_id: e.target.value, appointment_id: appt?.id || null})
                  }}>
                      <option value="">Select a patient...</option>
                      {appointments.map(a => (
                          <option key={a.id} value={a.patient_id}>
                              {a.patient?.full_name || "Unknown Patient"} ({a.appointment_date})
                          </option>
                      ))}
                  </select>
              </div>
              <div><label className="input-label">Valid Until</label><input className="input" type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} /></div>
            </div>
            <div><label className="input-label">Diagnosis</label><textarea className="input" placeholder="e.g. Hypertensive urgency — BP 160/100" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} /></div>
            <div><label className="input-label">Notes</label><textarea className="input" placeholder="Additional instructions for the patient..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="input-label" style={{ margin: 0 }}>Medications</p>
              <button className="btn-ghost" onClick={addMed} style={{ fontSize: 13 }}><Plus size={14} /> Add Medication</button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
                {meds.map((med, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Medication #{i + 1}</span>
                    {meds.length > 1 && <button className="btn-ghost" style={{ padding: 4, color: "var(--error)" }} onClick={() => removeMed(i)}><Trash2 size={14} /></button>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
                    <input className="input" placeholder="Medication Name" value={med.medication_name} onChange={e => updateMed(i, "medication_name", e.target.value)} />
                    <input className="input" placeholder="Dosage" value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} />
                    <input className="input" placeholder="Frequency" value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} />
                    <input className="input" placeholder="Duration" value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} />
                    </div>
                    <input className="input" placeholder="Instructions (e.g. Take with food)" style={{ marginTop: 8 }} value={med.instructions} onChange={e => updateMed(i, "instructions", e.target.value)} />
                </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                  Save Prescription
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Prescriptions
