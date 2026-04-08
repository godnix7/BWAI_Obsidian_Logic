import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import Modal from "@/components/ui/Modal"
import { pageEnter } from "@/utils/animations"
import { Clock, Plus, Trash2, Loader2, Save } from "lucide-react"
import { getSchedule, updateSchedule } from "@/api/Doctor.api"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const Schedule = () => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  // Add Slot Modal State
  const [addOpen, setAddOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30
  })

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const res = await getSchedule()
      setSchedule(res.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch schedule:", err)
      setError("Failed to load your schedule.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchSchedule()
    pageEnter() 
  }, [])

  const handleRemove = (id) => {
      setSchedule(s => s.filter(x => x.id !== id && x._tempId !== id))
  }

  const handleAddLocal = () => {
      const tempId = Math.random().toString(36).substr(2, 9)
      setSchedule([...schedule, { ...newSlot, _tempId: tempId, is_active: true }])
      setAddOpen(false)
  }

  const handleSave = async () => {
      try {
          setSaving(true)
          // Backend expects a list of schedules
          const payload = schedule.map(s => ({
              day_of_week: s.day_of_week,
              start_time: s.start_time,
              end_time: s.end_time,
              slot_duration_minutes: s.slot_duration_minutes
          }))
          await updateSchedule(payload)
          alert("Schedule updated successfully!")
          fetchSchedule()
      } catch (err) {
          alert("Failed to save schedule.")
      } finally {
          setSaving(false)
      }
  }

  if (loading) return (
     <DashboardLayout>
       <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
     </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="My Schedule" description="Manage your weekly availability">
        <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
            </button>
            <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Slot</button>
        </div>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {days.map((day, idx) => {
          const slots = schedule.filter(s => s.day_of_week === idx)
          return (
            <div key={day} className="glass-card" style={{ padding: 16, minHeight: 250 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 12, textAlign: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>{day}</h4>
              {slots.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", marginTop: 40 }}>No slots</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {slots.map((slot, sIdx) => (
                    <div key={slot.id || slot._tempId || sIdx} style={{
                      padding: 10, borderRadius: 8, fontSize: 12,
                      background: slot.is_active ? "var(--bg-accent)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${slot.is_active ? "var(--accent)" : "var(--border-subtle)"}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </span>
                        <button onClick={() => handleRemove(slot.id || slot._tempId)} style={{
                          background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--error)", opacity: 0.6
                        }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                        {slot.slot_duration_minutes}min slots
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {addOpen && (
        <Modal title="Add Availability Slot" onClose={() => setAddOpen(false)}>
           <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                  <label className="input-label">Day of Week</label>
                  <select className="input" value={newSlot.day_of_week} onChange={e => setNewSlot({...newSlot, day_of_week: parseInt(e.target.value)})}>
                      {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                      <label className="input-label">Start Time</label>
                      <input type="time" className="input" value={newSlot.start_time} onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} />
                  </div>
                  <div>
                      <label className="input-label">End Time</label>
                      <input type="time" className="input" value={newSlot.end_time} onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} />
                  </div>
              </div>
              <div>
                  <label className="input-label">Slot Duration (minutes)</label>
                  <input type="number" className="input" value={newSlot.slot_duration_minutes} onChange={e => setNewSlot({...newSlot, slot_duration_minutes: parseInt(e.target.value)})} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                  <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAddLocal}>Confirm Slot</button>
              </div>
           </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Schedule
