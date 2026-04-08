import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { mockPatients } from "@/data/mockData"
import { Save, Edit3, X } from "lucide-react"

const Profile = () => {
  const patient = mockPatients[0]
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: patient.full_name, date_of_birth: patient.date_of_birth,
    gender: patient.gender, blood_group: patient.blood_group, phone: patient.phone,
    address: patient.address, emergency_contact_name: patient.emergency_contact_name,
    emergency_contact_phone: patient.emergency_contact_phone,
    allergies: patient.allergies.join(", "), chronic_conditions: patient.chronic_conditions.join(", ")
  })

  useEffect(() => { pageEnter() }, [])
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" description="Manage your personal health information">
        {editing ? (
          <><button className="btn-ghost" onClick={() => setEditing(false)}><X size={16} /> Cancel</button>
            <button className="btn-primary" onClick={() => setEditing(false)}><Save size={16} /> Save</button></>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>
        )}
      </PageHeader>

      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label className="input-label">Full Name</label>
            <input className="input" value={form.full_name} disabled={!editing} onChange={e => update("full_name", e.target.value)} /></div>
          <div><label className="input-label">Date of Birth</label>
            <input className="input" type="date" value={form.date_of_birth} disabled={!editing} onChange={e => update("date_of_birth", e.target.value)} /></div>
          <div><label className="input-label">Gender</label>
            <select className="input" value={form.gender} disabled={!editing} onChange={e => update("gender", e.target.value)}>
              <option>male</option><option>female</option><option>other</option></select></div>
          <div><label className="input-label">Blood Group</label>
            <select className="input" value={form.blood_group} disabled={!editing} onChange={e => update("blood_group", e.target.value)}>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}</select></div>
          <div><label className="input-label">Phone</label>
            <input className="input" value={form.phone} disabled={!editing} onChange={e => update("phone", e.target.value)} /></div>
          <div><label className="input-label">Address</label>
            <input className="input" value={form.address} disabled={!editing} onChange={e => update("address", e.target.value)} /></div>
        </div>

        <div className="divider" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Allergies & Conditions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label className="input-label">Allergies (comma separated)</label>
            <input className="input" value={form.allergies} disabled={!editing} onChange={e => update("allergies", e.target.value)} /></div>
          <div><label className="input-label">Chronic Conditions</label>
            <input className="input" value={form.chronic_conditions} disabled={!editing} onChange={e => update("chronic_conditions", e.target.value)} /></div>
        </div>

        <div className="divider" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Emergency Contact</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label className="input-label">Contact Name</label>
            <input className="input" value={form.emergency_contact_name} disabled={!editing} onChange={e => update("emergency_contact_name", e.target.value)} /></div>
          <div><label className="input-label">Contact Phone</label>
            <input className="input" value={form.emergency_contact_phone} disabled={!editing} onChange={e => update("emergency_contact_phone", e.target.value)} /></div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
