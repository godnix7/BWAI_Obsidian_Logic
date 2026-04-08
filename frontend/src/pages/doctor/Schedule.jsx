import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { mockSchedule } from "@/data/mockData"
import { Clock, Plus, Trash2 } from "lucide-react"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const Schedule = () => {
  const [schedule, setSchedule] = useState(mockSchedule)

  useEffect(() => { pageEnter() }, [])

  const removeSlot = (id) => setSchedule(s => s.filter(x => x.id !== id))

  return (
    <DashboardLayout>
      <PageHeader title="My Schedule" description="Manage your weekly availability">
        <button className="btn-primary"><Plus size={16} /> Add Slot</button>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
        {days.map((day, idx) => {
          const slots = schedule.filter(s => s.day_of_week === idx)
          return (
            <div key={day} className="glass-card" style={{ padding: 16, minHeight: 200 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{day}</h4>
              {slots.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>No slots</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {slots.map(slot => (
                    <div key={slot.id} style={{
                      padding: 10, borderRadius: 8, fontSize: 12,
                      background: slot.is_active ? "var(--accent-soft)" : "var(--glass-light)",
                      border: `1px solid ${slot.is_active ? "var(--border-accent)" : "var(--border-subtle)"}`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: slot.is_active ? "var(--accent)" : "var(--text-muted)" }}>
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <button onClick={() => removeSlot(slot.id)} style={{
                          background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)"
                        }}><Trash2 size={12} /></button>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                        {slot.slot_duration_minutes}min slots · Max {slot.max_patients_per_slot}
                      </div>
                      {!slot.is_active && <span className="badge badge-default" style={{ marginTop: 4, fontSize: 9 }}>INACTIVE</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}

export default Schedule
