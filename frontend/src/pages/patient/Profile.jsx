import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { Save, Edit3, X, Loader2, CheckCircle } from "lucide-react"
import { getProfile, updateProfile } from "@/api/Patient.api"

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [form, setForm] = useState({
    full_name: "", 
    date_of_birth: "",
    gender: "other", 
    blood_group: "O+", 
    phone: "",
    address: "", 
    emergency_contact_name: "",
    emergency_contact_phone: "",
    allergies: "", 
    chronic_conditions: ""
  })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getProfile()
      const p = res.data
      setForm({
        full_name: p.full_name || "",
        date_of_birth: p.date_of_birth || "",
        gender: p.gender || "other",
        blood_group: p.blood_group || "O+",
        phone: p.phone || "",
        address: p.address || "",
        emergency_contact_name: p.emergency_contact_name || "",
        emergency_contact_phone: p.emergency_contact_phone || "",
        allergies: p.allergies?.join(", ") || "",
        chronic_conditions: p.chronic_conditions?.join(", ") || ""
      })
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchProfile()
    pageEnter() 
  }, [])

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        ...form,
        allergies: form.allergies.split(",").map(s => s.trim()).filter(s => s),
        chronic_conditions: form.chronic_conditions.split(",").map(s => s.trim()).filter(s => s)
      }
      if (!payload.date_of_birth) delete payload.date_of_birth;
      await updateProfile(payload)
      await fetchProfile()
      setSaveSuccess(true)
      setEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      alert("Failed to update profile.")
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
      <PageHeader title="My Profile" description="Manage your personal health information">
        {editing ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-ghost" onClick={() => setEditing(false)} disabled={saving}><X size={16} /> Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {saveSuccess && <span style={{ color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={14}/> Saved!</span>}
            <button className="btn-secondary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>
          </div>
        )}
      </PageHeader>

      <div className="glass-card card" style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div><label className="input-label">Full Name</label>
            <input className="input" value={form.full_name} disabled={!editing} onChange={e => update("full_name", e.target.value)} /></div>
          <div><label className="input-label">Date of Birth</label>
            <input className="input" type="date" value={form.date_of_birth} disabled={!editing} onChange={e => update("date_of_birth", e.target.value)} /></div>
          <div><label className="input-label">Gender</label>
            <select className="input" value={form.gender} disabled={!editing} onChange={e => update("gender", e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select></div>
          <div><label className="input-label">Blood Group</label>
            <select className="input" value={form.blood_group} disabled={!editing} onChange={e => update("blood_group", e.target.value)}>
              {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
          <div><label className="input-label">Phone</label>
            <input className="input" value={form.phone} disabled={!editing} onChange={e => update("phone", e.target.value)} /></div>
          <div><label className="input-label">Address</label>
            <input className="input" value={form.address} disabled={!editing} onChange={e => update("address", e.target.value)} /></div>
        </div>

        <div className="divider" style={{ margin: "24px 0" }} />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Allergies & Conditions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <div><label className="input-label">Allergies (comma separated)</label>
            <input className="input" value={form.allergies} disabled={!editing} placeholder="e.g. Peanuts, Pollen" onChange={e => update("allergies", e.target.value)} /></div>
          <div><label className="input-label">Chronic Conditions (comma separated)</label>
            <input className="input" value={form.chronic_conditions} disabled={!editing} placeholder="e.g. Diabetes, Hypertension" onChange={e => update("chronic_conditions", e.target.value)} /></div>
        </div>

        <div className="divider" style={{ margin: "24px 0" }} />
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Emergency Contact</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
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
