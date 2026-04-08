import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { mockUsers } from "@/data/mockData"
import { LogIn } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")

    // Mock login — match by email
    const user = Object.values(mockUsers).find(u => u.email === email)
    if (user && password.length >= 6) {
      setAuth({ user, access_token: "mock-jwt-token-" + user.role })
      navigate(`/${user.role}`)
    } else {
      setError("Invalid credentials. Try: aarav@email.com / vikram@email.com / admin@apollomedicare.in")
    }
  }

  // Quick login buttons for demo
  const quickLogin = (role) => {
    const user = mockUsers[role]
    setAuth({ user, access_token: "mock-jwt-token-" + role })
    navigate(`/${role}`)
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #020811 0%, #080F1E 40%, #0D1628 100%)"
    }}>
      <div className="glass-elevated" style={{ width: 420, padding: 40 }}>
        <h1 className="gradient-text" style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          textAlign: "center", marginBottom: 8
        }}>MEDI LOCKER</h1>
        <p style={{ color: "var(--text-secondary)", textAlign: "center", fontSize: 14, marginBottom: 32 }}>
          Sign in to your account
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ color: "var(--error)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <LogIn size={16} /> Sign In
          </button>
        </form>

        <div className="divider" />

        <p style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", marginBottom: 12 }}>
          QUICK DEMO LOGIN
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => quickLogin("patient")} className="btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>Patient</button>
          <button onClick={() => quickLogin("doctor")} className="btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>Doctor</button>
          <button onClick={() => quickLogin("hospital")} className="btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px 12px" }}>Hospital</button>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", marginTop: 24 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
