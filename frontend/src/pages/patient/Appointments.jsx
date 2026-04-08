import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { getAppointments, bookAppointment, getAvailableDoctors, cancelAppointment } from "@/api/Patient.api"
import { Calendar, Plus, Search, Loader2, CheckCircle2, X } from "lucide-react"

const Appointments = () => {
  const [tab, setTab] = useState("upcoming")
  const [bookOpen, setBookOpen] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [search, setSearch] = useState("")
  
  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [bookingType, setBookingType] = useState("in_person")
  const [bookingReason, setBookingReason] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)

  const listRef = useRef(null)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await getAppointments()
      setAppointments(res.data)
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const res = await getAvailableDoctors()
      setAvailableDoctors(res.data)
    } catch (err) {
      console.error("Failed to fetch doctors:", err)
    }
  }

  useEffect(() => { 
    pageEnter(); 
    fetchAppointments();
    fetchDoctors();
    setTimeout(() => {
      cardStagger()
      if (listRef.current) scrollReveal(listRef.current)
    }, 100) 
  }, [])

  const handleBook = async () => {
    if (!selectedDoctor || !bookingDate || !bookingTime) return
    setBookingLoading(true)
    try {
      await bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        type: bookingType,
        reason: bookingReason,
        duration_minutes: 30
      })
      setBookOpen(false)
      fetchAppointments()
      // Reset form
      setSelectedDoctor(null)
      setBookingDate("")
      setBookingTime("")
      setBookingReason("")
      setBookingType("in_person")
    } catch (err) {
      console.error("Booking failed:", err)
      alert("Failed to book appointment. Please check if you have selected a doctor and filled in all fields.")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    try {
      await cancelAppointment(id)
      await fetchAppointments()
    } catch (err) {
      console.error("Cancel failed:", err)
      alert("Failed to cancel appointment.")
    }
  }

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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent)" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No appointments" description="Book your first appointment" />
      ) : (
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filtered.map(apt => (
            <div key={apt.id} className="glass-card card" style={{ width: "100%", height: "auto" }}>
              <div className="card-inner" style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", alignItems: "flex-start", padding: "32px 40px" }}>
                <div style={{ flex: "1 1 350px", minWidth: 300 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <h3 className="text-2xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{apt.doctor?.full_name || "Doctor"}</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <StatusBadge status={apt.status} />
                      <StatusBadge status={apt.type} />
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 600 }}>{apt.doctor?.specialization || "General consultation"}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12, lineHeight: 1.7, maxWidth: "600px" }}>{apt.reason}</p>
                </div>
                <div style={{ textAlign: "right", minWidth: 180, paddingLeft: 40, borderLeft: "3px solid var(--border-subtle)", alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--eggplant)" }}>{apt.appointment_date}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{apt.appointment_time}</p>
                  {["pending", "confirmed"].includes(apt.status) && (
                    <button className="btn-danger" style={{ padding: "8px 12px", fontSize: 12, alignSelf: "flex-end" }} onClick={() => handleCancel(apt.id)}>
                      <X size={14} /> Cancel
                    </button>
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
                <input className="input" placeholder="Search by name or specialization..." style={{ paddingLeft: 36 }}
                       value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, maxHeight: 200, overflowY: "auto", padding: 4 }}>
              {availableDoctors.filter(d => 
                d.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                d.specialization?.toLowerCase().includes(search.toLowerCase())
              ).map(doc => (
                <div key={doc.id} onClick={() => setSelectedDoctor(doc)}
                     className={`glass-card card ${selectedDoctor?.id === doc.id ? "active-border" : ""}`} 
                     style={{ 
                       padding: 16, 
                       cursor: "pointer", 
                       border: selectedDoctor?.id === doc.id ? "2px solid var(--accent)" : "1px solid var(--border-subtle)",
                       background: selectedDoctor?.id === doc.id ? "var(--bg-elevated)" : "var(--glass-light)"
                     }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{doc.full_name}</p>
                    {selectedDoctor?.id === doc.id && <CheckCircle2 size={16} color="var(--accent)" />}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>{doc.specialization}</p>
                  <p style={{ color: "var(--accent)", fontSize: 12, marginTop: 4 }}>₹{doc.consultation_fee}</p>
                </div>
              ))}
              {availableDoctors.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No doctors available.</p>}
            </div>

            {!selectedDoctor && (
              <p style={{ fontSize: 12, color: "var(--warning)", fontStyle: "italic" }}>Please select a doctor to continue.</p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Date</label><input className="input" type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} /></div>
              <div><label className="input-label">Time</label><input className="input" type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} /></div>
              <div><label className="input-label">Type</label>
                <select className="input" value={bookingType} onChange={e => setBookingType(e.target.value)}>
                    <option value="in_person">In Person</option><option value="video">Video</option><option value="phone">Phone</option>
                </select>
              </div>
            </div>
            <div><label className="input-label">Reason</label><textarea className="input" placeholder="Describe your concern..." value={bookingReason} onChange={e => setBookingReason(e.target.value)} /></div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setBookOpen(false)}>Cancel</button>
              <button className="btn-primary" 
                      onClick={handleBook} 
                      disabled={bookingLoading || !selectedDoctor || !bookingDate || !bookingTime}
                      title={!selectedDoctor ? "Select a doctor" : (!bookingDate || !bookingTime ? "Select date and time" : "Confirm")}>
                {bookingLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Appointments
