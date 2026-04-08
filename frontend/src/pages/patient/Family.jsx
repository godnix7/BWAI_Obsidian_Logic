import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import Modal from "@/components/ui/Modal"
import { pageEnter, cardStagger } from "@/utils/animations"
import { Users, Plus, Edit3, Trash2, Loader2 } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from "@/api/Patient.api"

const Family = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    relationship: "child",
    date_of_birth: "",
    blood_group: "O+",
    allergies: ""
  })

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await getFamilyMembers()
      setMembers(res.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch family:", err)
      setError("Failed to load family members.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchMembers()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this family member?")) return
    try {
      await deleteFamilyMember(id)
      setMembers(ms => ms.filter(x => x.id !== id))
    } catch (err) {
      alert("Failed to delete member.")
    }
  }

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.date_of_birth) return alert("Please fill mandatory fields")
    
    try {
      setSubmitting(true)
      // Convert comma-separated allergies to array for backend (if expected) 
      // or just send as string if that's what backend expects.
      // Based on models, it might be a JSONB or String. I'll send as is.
      const payload = {
          ...formData,
          allergies: formData.allergies.split(",").map(a => a.trim()).filter(a => a)
      }
      if (editingMemberId) {
        await updateFamilyMember(editingMemberId, payload)
      } else {
        await addFamilyMember(payload)
      }
      await fetchMembers()
      setAddOpen(false)
      setEditingMemberId(null)
      setFormData({ full_name: "", relationship: "child", date_of_birth: "", blood_group: "O+", allergies: "" })
    } catch (err) {
      alert(`Failed to ${editingMemberId ? "update" : "add"} member.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (member) => {
    setEditingMemberId(member.id)
    setFormData({
      full_name: member.full_name || "",
      relationship: member.relationship || "child",
      date_of_birth: member.date_of_birth || "",
      blood_group: member.blood_group || "O+",
      allergies: member.allergies?.join(", ") || ""
    })
    setAddOpen(true)
  }

  return (
    <DashboardLayout>
      <PageHeader title="Family Members" description="Manage health profiles for your family">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Member</button>
      </PageHeader>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--error)" }}>
          {error}
          <button onClick={fetchMembers} className="btn-ghost" style={{ display: "block", margin: "16px auto" }}>Retry</button>
        </div>
      ) : members.length === 0 ? (
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
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => handleEdit(m)}><Edit3 size={14} /></button>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
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
        <Modal title={editingMemberId ? "Edit Family Member" : "Add Family Member"} onClose={() => {
          setAddOpen(false)
          setEditingMemberId(null)
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="e.g. Priya Sharma" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="input-label">Relationship</label>
                <select className="input" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})}>
                  <option>spouse</option>
                  <option>child</option>
                  <option>parent</option>
                  <option>sibling</option>
                </select>
              </div>
              <div>
                <label className="input-label">Date of Birth</label>
                <input className="input" type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="input-label">Blood Group</label>
                <select className="input" value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})}>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="input-label">Allergies (comma separated)</label>
                <input className="input" placeholder="e.g. Dust, Pollen" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : editingMemberId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Family
