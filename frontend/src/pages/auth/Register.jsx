import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserPlus } from "lucide-react"

const roleTabs = ["patient", "doctor", "hospital"]

const Register = () => {
  const [role, setRole] = useState("patient")
  const [form, setForm] = useState({ email: "", password: "", confirm: "", full_name: "", phone: "" })
  const [extra, setExtra] = useState({ license_number: "", specialization: "", registration_number: "", hospital_name: "" })
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const updateExtra = (key, val) => setExtra(p => ({ ...p, [key]: val }))

  const handleRegister = (e) => {
    e.preventDefault()
    // Mock — just show success
    setSuccess(true)
    setTimeout(() => navigate("/login"), 2000)
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #020811 0%, #080F1E 40%, #0D1628 100%)", padding: 20
    }}>
      <div className="glass-elevated" style={{ width: 480, padding: 40 }}>
        <h1 className="gradient-text" style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          textAlign: "center", marginBottom: 8
        }}>Create Account</h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: 14, marginBottom: 24 }}>
          Join MediLocker as a {role}
        </p>

        {/* Role tabs */}
        <div className="tab-bar" style={{ marginBottom: 24 }}>
          {roleTabs.map(r => (
            <button key={r} className={`tab-item ${role === r ? "active" : ""}`}
              onClick={() => setRole(r)} style={{ flex: 1, textTransform: "capitalize" }}>
              {r}
            </button>
          ))}
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <p style={{ color: "var(--success)", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>✓ Registration successful!</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label className="input-label">Full Name</label>
                <input className="input" placeholder="John Doe" value={form.full_name} onChange={e => update("full_name", e.target.value)} required /></div>
              <div><label className="input-label">Phone</label>
                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => update("password", e.target.value)} required /></div>
              <div><label className="input-label">Confirm Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => update("confirm", e.target.value)} required /></div>
            </div>

            {role === "doctor" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label className="input-label">License Number</label>
                  <input className="input" placeholder="MH-12345" value={extra.license_number} onChange={e => updateExtra("license_number", e.target.value)} required /></div>
                <div><label className="input-label">Specialization</label>
                  <input className="input" placeholder="Cardiologist" value={extra.specialization} onChange={e => updateExtra("specialization", e.target.value)} required /></div>
              </div>
            )}

            {role === "hospital" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label className="input-label">Hospital Name</label>
                  <input className="input" placeholder="Apollo Hospital" value={extra.hospital_name} onChange={e => updateExtra("hospital_name", e.target.value)} required /></div>
                <div><label className="input-label">Registration No.</label>
                  <input className="input" placeholder="HOSP-MH-2021" value={extra.registration_number} onChange={e => updateExtra("registration_number", e.target.value)} required /></div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              <UserPlus size={16} /> Create Account
            </button>
          </form>
        )}

        <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", marginTop: 24 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
