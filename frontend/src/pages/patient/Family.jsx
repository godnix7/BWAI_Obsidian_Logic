import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import Modal from "@/components/ui/Modal"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockFamilyMembers } from "@/data/mockData"
import { Users, Plus, Edit3, Trash2 } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"

const Family = () => {
  const [members, setMembers] = useState(mockFamilyMembers)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Family Members" description="Manage health profiles for your family">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Member</button>
      </PageHeader>

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No family members" description="Add your family members to manage their records" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {members.map(m => (
            <div key={m.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{m.full_name}</h3>
                  <span className="badge badge-accent" style={{ textTransform: "capitalize" }}>{m.relationship}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: 6 }}><Edit3 size={14} /></button>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => setMembers(ms => ms.filter(x => x.id !== m.id))}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <span>🎂 {m.date_of_birth}</span>
                <span>🩸 {m.blood_group || "N/A"}</span>
              </div>
              {m.allergies?.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {m.allergies.map(a => <span key={a} className="badge badge-warning">{a}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <Modal title="Add Family Member" onClose={() => setAddOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Full Name</label><input className="input" placeholder="e.g. Priya Sharma" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Relationship</label>
                <select className="input"><option>spouse</option><option>child</option><option>parent</option><option>sibling</option></select></div>
              <div><label className="input-label">Date of Birth</label><input className="input" type="date" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Blood Group</label>
                <select className="input"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></div>
              <div><label className="input-label">Allergies (comma separated)</label><input className="input" placeholder="e.g. Dust, Pollen" /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setAddOpen(false)}>Add Member</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Family
