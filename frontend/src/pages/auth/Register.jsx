import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserPlus, Loader2 } from "lucide-react"
import { registerApi } from "@/api/auth.api"

const roleTabs = ["patient", "doctor", "hospital"]

const Register = () => {
  const [role, setRole] = useState("patient")
  const [form, setForm] = useState({ email: "", password: "", confirm: "", full_name: "", phone: "" })
  const [extra, setExtra] = useState({ license_number: "", specialization: "", registration_number: "", hospital_name: "" })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const updateExtra = (key, val) => setExtra(p => ({ ...p, [key]: val }))

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm) {
      setError("Passwords do not match")
      return
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)
    try {
      // Build request body per RegisterRequest schema requirements
      const requestData = {
        email: form.email,
        password: form.password,
        phone: form.phone?.trim() || null,
        role: role,
        full_name: form.full_name,
      }

      // Add role-specific extras only if relevant
      if (role === "doctor") {
        requestData.license_number = extra.license_number
        requestData.specialization = extra.specialization
      } else if (role === "hospital") {
        requestData.hospital_name = extra.hospital_name
        requestData.registration_number = extra.registration_number
      }

      console.log("Registering with payload:", requestData)
      await registerApi(requestData)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      console.error("Registration error:", err)
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail
        setError(Array.isArray(detail) ? detail.map(d => `${d.loc.join(".")}: ${d.msg}`).join(", ") : detail)
      } else {
        setError("Network error. Could not connect to the server.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-base)",
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(74, 139, 223, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(160, 0, 109, 0.08) 0px, transparent 50%)
      `,
      padding: 24
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 40, background: "rgba(255, 255, 255, 0.6)" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 480 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 12 }}>
              <div><label className="input-label">Full Name</label>
                <input className="input" placeholder="John Doe" value={form.full_name} onChange={e => update("full_name", e.target.value)} required /></div>
              <div><label className="input-label">Phone</label>
                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} /></div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 480 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 12 }}>
              <div><label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => update("password", e.target.value)} required /></div>
              <div><label className="input-label">Confirm Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => update("confirm", e.target.value)} required /></div>
            </div>

            {role === "doctor" && (
              <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 480 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 12 }}>
                <div><label className="input-label">License Number</label>
                  <input className="input" placeholder="MH-12345" value={extra.license_number} onChange={e => updateExtra("license_number", e.target.value)} required /></div>
                <div><label className="input-label">Specialization</label>
                  <input className="input" placeholder="Cardiologist" value={extra.specialization} onChange={e => updateExtra("specialization", e.target.value)} required /></div>
              </div>
            )}

            {role === "hospital" && (
              <div style={{ display: "grid", gridTemplateColumns: window.innerWidth > 480 ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 12 }}>
                <div><label className="input-label">Hospital Name</label>
                  <input className="input" placeholder="Apollo Hospital" value={extra.hospital_name} onChange={e => updateExtra("hospital_name", e.target.value)} required /></div>
                <div><label className="input-label">Registration No.</label>
                  <input className="input" placeholder="HOSP-MH-2021" value={extra.registration_number} onChange={e => updateExtra("registration_number", e.target.value)} required /></div>
              </div>
            )}

            {error && <p style={{ color: "var(--error)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              {loading ? "Creating Account..." : "Create Account"}
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
