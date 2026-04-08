import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { Save, Edit3, X, Loader2, Hospital } from "lucide-react"
import { getHospitalProfile, updateHospitalProfile } from "@/api/Hospital.api"

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    hospital_name: "", registration_number: "",
    type: "", address: "", city: "", state: "",
    phone: "", email: "", bed_count: 0,
  })

  const fetchData = async () => {
      try {
          setLoading(true)
          const res = await getHospitalProfile()
          setForm(res.data)
      } catch (err) {
          console.error("Failed to fetch hospital profile:", err)
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => { 
      fetchData()
      pageEnter() 
  }, [])

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
      try {
          setSubmitting(true)
          await updateHospitalProfile(form)
          await fetchData()
          setEditing(false)
      } catch (err) {
          alert("Failed to update hospital profile.")
      } finally {
          setSubmitting(false)
      }
  }

  if (loading) return (
      <DashboardLayout>
           <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Hospital Profile" description="Manage your hospital information">
        {editing ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-ghost" onClick={() => setEditing(false)} disabled={submitting}><X size={16} /> Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                Save Changes
            </button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>
        )}
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 32 }}>
          <div className="glass-card" style={{ padding: 24, textAlign: "center", height: "fit-content" }}>
              <div style={{ 
                  width: 80, height: 80, borderRadius: "50%", background: "var(--bg-accent)", 
                  margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" 
              }}>
                  <Hospital size={40} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{form.hospital_name}</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginTop: 12 }}>Registration ID</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, marginTop: 4 }}>{form.registration_number}</p>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Hospital Name</label>
                    <input className="input" value={form.hospital_name} disabled={!editing} onChange={e => update("hospital_name", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Facility Type</label>
                    <select className="input" value={form.type} disabled={!editing} onChange={e => update("type", e.target.value)}>
                        <option value="private">Private Hospital</option>
                        <option value="government">Government Facility</option>
                        <option value="clinic">Clinical Center</option>
                    </select>
                </div>
                <div>
                    <label className="input-label">Total Bed Count</label>
                    <input className="input" type="number" value={form.bed_count} disabled={!editing} onChange={e => update("bed_count", parseInt(e.target.value))} />
                </div>
            </div>

            <div className="divider" style={{ margin: "24px 0" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Contact & Location Details</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Physical Address</label>
                    <input className="input" value={form.address} disabled={!editing} onChange={e => update("address", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">City</label>
                    <input className="input" value={form.city} disabled={!editing} onChange={e => update("city", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">State</label>
                    <input className="input" value={form.state} disabled={!editing} onChange={e => update("state", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Official Phone</label>
                    <input className="input" value={form.phone} disabled={!editing} onChange={e => update("phone", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Primary Email</label>
                    <input className="input" type="email" value={form.email} disabled={!editing} onChange={e => update("email", e.target.value)} />
                </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
