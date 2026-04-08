import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { mockAppointments, mockDoctors } from "@/data/mockData"
import { Calendar, Plus, Search } from "lucide-react"

const Appointments = () => {
  const [tab, setTab] = useState("upcoming")
  const [bookOpen, setBookOpen] = useState(false)
  const appointments = mockAppointments.filter(a => a.patient_id === "p1")

  const listRef = useRef(null)

  useEffect(() => { 
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (listRef.current) scrollReveal(listRef.current)
    }, 100) 
  }, [])

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
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card card" style={{ width: "100%", height: "auto" }}>
              <div className="card-inner" style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", alignItems: "flex-start", padding: "32px 40px" }}>
                <div style={{ flex: "1 1 350px", minWidth: 300 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <h3 className="text-2xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{apt.doctor?.full_name}</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <StatusBadge status={apt.status} />
                      <StatusBadge status={apt.type} />
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 600 }}>{apt.doctor?.specialization}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12, lineHeight: 1.7, maxWidth: "600px" }}>{apt.reason}</p>
                </div>
                <div style={{ textAlign: "right", minWidth: 180, paddingLeft: 40, borderLeft: "3px solid var(--border-subtle)", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--eggplant)" }}>{apt.appointment_date}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{apt.appointment_time}</p>
                  {["pending", "confirmed"].includes(apt.status) && (
                    <button className="btn-danger" style={{ marginTop: 12, padding: "8px 16px", fontSize: 12 }}>Cancel</button>
                  )}
                </div>
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
                <div key={doc.id} className="glass-card card" style={{ padding: 16, cursor: "pointer" }}>
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
