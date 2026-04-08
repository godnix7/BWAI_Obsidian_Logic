import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { mockHospitals } from "@/data/mockData"
import { Save, Edit3, X } from "lucide-react"

const Profile = () => {
  const hosp = mockHospitals[0]
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    hospital_name: hosp.hospital_name, registration_number: hosp.registration_number,
    type: hosp.type, address: hosp.address, city: hosp.city, state: hosp.state,
    phone: hosp.phone, email: hosp.email, bed_count: hosp.bed_count,
  })
  useEffect(() => { pageEnter() }, [])
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <DashboardLayout>
      <PageHeader title="Hospital Profile" description="Manage your hospital information">
        {editing ? (
          <><button className="btn-ghost" onClick={() => setEditing(false)}><X size={16} /> Cancel</button>
            <button className="btn-primary" onClick={() => setEditing(false)}><Save size={16} /> Save</button></>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit</button>
        )}
      </PageHeader>

      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div><label className="input-label">Hospital Name</label>
            <input className="input" value={form.hospital_name} disabled={!editing} onChange={e => update("hospital_name", e.target.value)} /></div>
          <div><label className="input-label">Registration Number</label>
            <input className="input" value={form.registration_number} disabled={!editing} onChange={e => update("registration_number", e.target.value)} /></div>
          <div><label className="input-label">Type</label>
            <select className="input" value={form.type} disabled={!editing} onChange={e => update("type", e.target.value)}>
              <option>private</option><option>government</option><option>clinic</option></select></div>
          <div><label className="input-label">Bed Count</label>
            <input className="input" type="number" value={form.bed_count} disabled={!editing} onChange={e => update("bed_count", e.target.value)} /></div>
        </div>

        <div className="divider" />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contact & Location</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ gridColumn: "span 2" }}><label className="input-label">Address</label>
            <input className="input" value={form.address} disabled={!editing} onChange={e => update("address", e.target.value)} /></div>
          <div><label className="input-label">City</label>
            <input className="input" value={form.city} disabled={!editing} onChange={e => update("city", e.target.value)} /></div>
          <div><label className="input-label">State</label>
            <input className="input" value={form.state} disabled={!editing} onChange={e => update("state", e.target.value)} /></div>
          <div><label className="input-label">Phone</label>
            <input className="input" value={form.phone} disabled={!editing} onChange={e => update("phone", e.target.value)} /></div>
          <div><label className="input-label">Email</label>
            <input className="input" type="email" value={form.email} disabled={!editing} onChange={e => update("email", e.target.value)} /></div>
        </div>

        <div className="divider" />
        <div><label className="input-label">Hospital Logo</label>
          <input type="file" accept="image/*" className="input" style={{ padding: 8 }} disabled={!editing} /></div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
