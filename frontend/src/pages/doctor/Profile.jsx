import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter } from "@/utils/animations"
import { Save, Edit3, X, Loader2, Award } from "lucide-react"
import { getDoctorProfile, updateDoctorProfile } from "@/api/Doctor.api"

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: "", 
    specialization: "",
    license_number: "", 
    years_experience: 0,
    consultation_fee: 0, 
    bio: "",
  })

  const fetchData = async () => {
      try {
          setLoading(true)
          const res = await getDoctorProfile()
          setForm(res.data)
      } catch (err) {
          console.error("Failed to fetch doctor profile:", err)
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
          await updateDoctorProfile(form)
          await fetchData()
          setEditing(false)
      } catch (err) {
          alert("Failed to update profile.")
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
      <PageHeader title="My Profile" description="Manage your professional profile">
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
                  <Award size={40} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>Dr. {form.full_name?.split(" ").pop()}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{form.specialization}</p>
              <div className="divider" style={{ margin: "16px 0" }} />
              <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>License</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, marginTop: 4 }}>{form.license_number}</p>
              </div>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Professional Name</label>
                    <input className="input" value={form.full_name} disabled={!editing} onChange={e => update("full_name", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Specialization</label>
                    <input className="input" value={form.specialization} disabled={!editing} onChange={e => update("specialization", e.target.value)} />
                </div>
                <div>
                    <label className="input-label">Experience (Years)</label>
                    <input className="input" type="number" value={form.years_experience} disabled={!editing} onChange={e => update("years_experience", parseInt(e.target.value))} />
                </div>
                <div>
                    <label className="input-label">Consultation Fee (₹)</label>
                    <input className="input" type="number" value={form.consultation_fee} disabled={!editing} onChange={e => update("consultation_fee", parseFloat(e.target.value))} />
                </div>
            </div>
            <div className="divider" style={{ margin: "24px 0" }} />
            <div>
                <label className="input-label">Professional Bio & Experience</label>
                <textarea className="input" value={form.bio} disabled={!editing} onChange={e => update("bio", e.target.value)} style={{ minHeight: 120, lineHeight: 1.6 }} />
            </div>
          </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
