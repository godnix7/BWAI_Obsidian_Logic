import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { loginApi } from "@/api/auth.api"
import { LogIn, Loader2 } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await loginApi(email, password)
      setAuth(res.data)
      navigate(`/${res.data.user.role}`)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail)
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
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: 40, background: "rgba(255, 255, 255, 0.6)" }}>
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

          <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />} 
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ color: "var(--text-secondary)", fontSize: 13, textAlign: "center", marginTop: 24 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
