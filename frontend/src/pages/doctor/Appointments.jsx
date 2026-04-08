import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { getDoctorAppointments, updateAppointmentStatus } from "@/api/Doctor.api"
import { Calendar, Check, X, CheckCircle, Loader2 } from "lucide-react"

const Appointments = () => {
  const [tab, setTab] = useState("pending")
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [completeModal, setCompleteModal] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [completionNotes, setCompletionNotes] = useState("")

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await getDoctorAppointments()
      setAppointments(res.data)
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    pageEnter()
    setTimeout(() => cardStagger(), 100)
    fetchAppointments()
  }, [])

  const counts = { 
    pending: appointments.filter(a => a.status === "pending").length, 
    confirmed: appointments.filter(a => a.status === "confirmed").length, 
    completed: appointments.filter(a => a.status === "completed").length 
  }
  const filtered = tab === "all" ? appointments : appointments.filter(a => a.status === tab)

  const handleUpdateStatus = async (id, status, notes = "", reason = "") => {
    try {
      await updateAppointmentStatus(id, status, notes, reason)
      fetchAppointments() // Refresh list
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Appointments" description="Manage your patient appointments" />

      <div className="tab-bar" style={{ marginBottom: 24, width: "fit-content" }}>
        {["pending", "confirmed", "completed", "all"].map(t => (
          <button key={t} className={`tab-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>
            {t} {counts[t] !== undefined ? `(${counts[t]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <Loader2 className="animate-spin" size={32} color="var(--accent)" />
        </div>
      ) : filtered.length === 0 ? <EmptyState icon={Calendar} title={`No ${tab} appointments`} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 600 }}>{apt.patient?.full_name || "Unknown Patient"}</h3>
                  <StatusBadge status={apt.status} />
                  <StatusBadge status={apt.type} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{apt.reason}</p>
                {apt.notes && <p style={{ color: "var(--accent)", fontSize: 12, marginTop: 4 }}>📝 {apt.notes}</p>}
                {apt.rejection_reason && <p style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>❌ {apt.rejection_reason}</p>}
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "end", gap: 8 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{apt.appointment_date}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>{apt.appointment_time}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {apt.status === "pending" && <>
                    <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => handleUpdateStatus(apt.id, "confirmed")}><Check size={14} /> Approve</button>
                    <button className="btn-danger" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setRejectModal(apt)}><X size={14} /> Reject</button>
                  </>}
                  {apt.status === "confirmed" && <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => setCompleteModal(apt)}><CheckCircle size={14} /> Complete</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <Modal title="Reject Appointment" onClose={() => setRejectModal(null)}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>Patient: {rejectModal.patient?.full_name}</p>
          <label className="input-label">Rejection Reason</label>
          <textarea 
            className="input" 
            placeholder="Explain why this appointment is being rejected..." 
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <button className="btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
            <button className="btn-danger" onClick={() => { handleUpdateStatus(rejectModal.id, "rejected", "", rejectReason); setRejectModal(null); setRejectReason("") }}>Reject</button>
          </div>
        </Modal>
      )}

      {completeModal && (
        <Modal title="Complete Appointment" onClose={() => setCompleteModal(null)}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>Patient: {completeModal.patient?.full_name}</p>
          <label className="input-label">Post-Appointment Notes</label>
          <textarea 
            className="input" 
            placeholder="Add notes about the visit..." 
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
            <button className="btn-ghost" onClick={() => setCompleteModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={() => { handleUpdateStatus(completeModal.id, "completed", completionNotes); setCompleteModal(null); setCompletionNotes("") }}>Mark Complete</button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Appointments
