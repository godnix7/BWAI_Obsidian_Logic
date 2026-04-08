import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockAppointments, mockDoctors } from "@/data/mockData"
import { Calendar, Plus, Search } from "lucide-react"

const Appointments = () => {
  const [tab, setTab] = useState("upcoming")
  const [bookOpen, setBookOpen] = useState(false)
  const appointments = mockAppointments.filter(a => a.patient_id === "p1")

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  const filtered = appointments.filter(a => {
    if (tab === "upcoming") return ["pending", "confirmed"].includes(a.status)
    if (tab === "past") return ["completed", "rejected", "cancelled"].includes(a.status)
    return true
  })

  return (
    <DashboardLayout>
      <PageHeader title="Appointments" description="Book and manage your appointments">
        <button className="btn-primary" onClick={() => setBookOpen(true)}><Plus size={16} /> Book Appointment</button>
      </PageHeader>

      <div className="tab-bar" style={{ marginBottom: 24, width: "fit-content" }}>
        {["upcoming", "past", "all"].map(t => (
          <button key={t} className={`tab-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}
            style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" description="Book your first appointment" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 600 }}>{apt.doctor?.full_name}</h3>
                  <StatusBadge status={apt.status} />
                  <StatusBadge status={apt.type} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{apt.doctor?.specialization}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{apt.reason}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600 }}>{apt.appointment_date}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>{apt.appointment_time}</p>
                {["pending", "confirmed"].includes(apt.status) && (
                  <button className="btn-danger" style={{ marginTop: 8, padding: "6px 14px", fontSize: 12 }}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Modal */}
      {bookOpen && (
        <Modal title="Book Appointment" onClose={() => setBookOpen(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search Doctor</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="Search by name or specialization..." style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {mockDoctors.map(doc => (
                <div key={doc.id} className="glass-card" style={{ padding: 16, cursor: "pointer", transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{doc.full_name}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{doc.specialization}</p>
                  <p style={{ color: "var(--accent)", fontSize: 12, marginTop: 4 }}>₹{doc.consultation_fee}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Date</label><input className="input" type="date" /></div>
              <div><label className="input-label">Time</label><input className="input" type="time" /></div>
              <div><label className="input-label">Type</label>
                <select className="input"><option>In Person</option><option>Video</option><option>Phone</option></select></div>
            </div>
            <div><label className="input-label">Reason</label><textarea className="input" placeholder="Describe your concern..." /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setBookOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setBookOpen(false)}>Confirm Booking</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Appointments
