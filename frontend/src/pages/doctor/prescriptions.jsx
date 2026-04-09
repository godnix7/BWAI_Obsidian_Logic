import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { ClipboardPlus, Plus, Trash2, Loader2, Pill } from "lucide-react"
import { getIssuedPrescriptions, createPrescription, getPrescriptionPatients } from "@/api/Doctor.api"

const Prescriptions = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [prescriptionPatients, setPrescriptionPatients] = useState([])
  const [createOpen, setCreateOpen] = useState(false)

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
      const [rxRes, patientsRes] = await Promise.all([
        getIssuedPrescriptions(),
        getPrescriptionPatients()
      ])
      setPrescriptions(rxRes.data)
      setPrescriptionPatients(patientsRes.data)
      if (patientsRes.data.length > 0 && !form.patient_id) {
        const first = patientsRes.data[0]
        setForm((current) => ({
          ...current,
          patient_id: first.patient_id,
          appointment_id: first.appointment_id
        }))
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    pageEnter()
    setTimeout(() => cardStagger(), 500)
  }, [])

  const addMed = () => setMeds((current) => [...current, { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
  const removeMed = (index) => setMeds((current) => current.filter((_, idx) => idx !== index))
  const updateMed = (index, key, value) => {
    const next = [...meds]
    next[index][key] = value
    setMeds(next)
  }

  const handleSubmit = async () => {
    if (!form.patient_id || !form.diagnosis || meds.some((med) => !med.medication_name)) {
      return alert("Please fill mandatory fields")
    }

    try {
      setSubmitting(true)
      const payload = {
        ...form,
        medications: meds
      }
      if (!payload.valid_until) {
        delete payload.valid_until
      }
      await createPrescription(payload)
      await fetchData()
      setCreateOpen(false)
      setMeds([{ medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" }])
      setForm({ patient_id: "", appointment_id: null, diagnosis: "", notes: "", valid_until: "" })
    } catch (err) {
      alert("Failed to create prescription.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader title="Prescriptions" description="Create and manage prescriptions">
        <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> New Prescription</button>
      </PageHeader>

      {prescriptions.length === 0 ? <EmptyState icon={ClipboardPlus} title="No prescriptions yet" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prescriptions.map((rx) => (
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
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>ID: {rx.id.substring(0, 8)}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {rx.medications?.map((med, index) => (
                  <div key={`${rx.id}-${index}`} style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "start",
                    gap: 10
                  }}>
                    <Pill size={14} style={{ color: "var(--accent)", marginTop: 2 }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{med.medication_name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{med.dosage} · {med.frequency} · {med.duration}</p>
                      {med.instructions && <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>"{med.instructions}"</p>}
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
                <label className="input-label">Patient (Approved Appointments)</label>
                <select className="input" value={form.patient_id} onChange={(e) => {
                  const selected = prescriptionPatients.find((item) => item.patient_id === e.target.value)
                  setForm({ ...form, patient_id: e.target.value, appointment_id: selected?.appointment_id || null })
                }}>
                  <option value="">Select a patient...</option>
                  {prescriptionPatients.length === 0 && (
                    <option disabled value="">No approved appointments found</option>
                  )}
                  {prescriptionPatients.map((patient) => (
                    <option key={patient.appointment_id} value={patient.patient_id}>
                      {patient.patient_name} - {patient.appointment_date}
                    </option>
                  ))}
                </select>
              </div>
              <div><label className="input-label">Valid Until</label><input className="input" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
            </div>
            <div><label className="input-label">Diagnosis</label><textarea className="input" placeholder="e.g. Hypertensive urgency - BP 160/100" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
            <div><label className="input-label">Notes</label><textarea className="input" placeholder="Additional instructions for the patient..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="input-label" style={{ margin: 0 }}>Medications</p>
              <button className="btn-ghost" onClick={addMed} style={{ fontSize: 13 }}><Plus size={14} /> Add Medication</button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4 }}>
              {meds.map((med, index) => (
                <div key={index} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Medication #{index + 1}</span>
                    {meds.length > 1 && <button className="btn-ghost" style={{ padding: 4, color: "var(--error)" }} onClick={() => removeMed(index)}><Trash2 size={14} /></button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8 }}>
                    <input className="input" placeholder="Medication Name" value={med.medication_name} onChange={(e) => updateMed(index, "medication_name", e.target.value)} />
                    <input className="input" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(index, "dosage", e.target.value)} />
                    <input className="input" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMed(index, "frequency", e.target.value)} />
                    <input className="input" placeholder="Duration" value={med.duration} onChange={(e) => updateMed(index, "duration", e.target.value)} />
                  </div>
                  <input className="input" placeholder="Instructions (e.g. Take with food)" style={{ marginTop: 8 }} value={med.instructions} onChange={(e) => updateMed(index, "instructions", e.target.value)} />
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