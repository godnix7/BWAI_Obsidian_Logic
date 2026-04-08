import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { mockDoctors } from "@/data/mockData"
import { Save, Edit3, X } from "lucide-react"

const Profile = () => {
  const doc = mockDoctors[0]
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: doc.full_name, specialization: doc.specialization,
    license_number: doc.license_number, years_experience: doc.years_experience,
    consultation_fee: doc.consultation_fee, bio: doc.bio,
  })
  useEffect(() => { pageEnter() }, [])
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" description="Manage your professional profile">
        {editing ? (
          <><button className="btn-ghost" onClick={() => setEditing(false)}><X size={16} /> Cancel</button>
            <button className="btn-primary" onClick={() => setEditing(false)}><Save size={16} /> Save</button></>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit</button>
        )}
      </PageHeader>

      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label className="input-label">Full Name</label>
            <input className="input" value={form.full_name} disabled={!editing} onChange={e => update("full_name", e.target.value)} /></div>
          <div><label className="input-label">Specialization</label>
            <input className="input" value={form.specialization} disabled={!editing} onChange={e => update("specialization", e.target.value)} /></div>
          <div><label className="input-label">License Number</label>
            <input className="input" value={form.license_number} disabled={!editing} onChange={e => update("license_number", e.target.value)} /></div>
          <div><label className="input-label">Years of Experience</label>
            <input className="input" type="number" value={form.years_experience} disabled={!editing} onChange={e => update("years_experience", e.target.value)} /></div>
          <div><label className="input-label">Consultation Fee (₹)</label>
            <input className="input" type="number" value={form.consultation_fee} disabled={!editing} onChange={e => update("consultation_fee", e.target.value)} /></div>
        </div>
        <div className="divider" />
        <div><label className="input-label">Bio</label>
          <textarea className="input" value={form.bio} disabled={!editing} onChange={e => update("bio", e.target.value)} style={{ minHeight: 100 }} /></div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
