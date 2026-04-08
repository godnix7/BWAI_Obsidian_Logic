import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { Shield, Plus, ShieldOff, Search, Loader2 } from "lucide-react"
import { getConsents, grantConsent, revokeConsent, getAvailableDoctors } from "@/api/Patient.api"

const Consents = () => {
  const [consents, setConsents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [grantOpen, setGrantOpen] = useState(false)
  
  // Search state
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [selectedGrantee, setSelectedGrantee] = useState(null)
  const [accessLevel, setAccessLevel] = useState("read_only")
  const [recordTypes, setRecordTypes] = useState(["lab_report", "prescription"])
  const [expiryDate, setExpiryDate] = useState("")

  const active = consents.filter(c => c.status === "active")
  const inactive = consents.filter(c => c.status !== "active")

  const activeRef = useRef(null)
  const inactiveRef = useRef(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [consentsRes, docsRes] = await Promise.all([
          getConsents(),
          getAvailableDoctors()
      ])
      setConsents(consentsRes.data)
      setDoctors(docsRes.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch consents:", err)
      setError("Failed to load consent data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (activeRef.current) scrollReveal(activeRef.current)
      if (inactiveRef.current) scrollReveal(inactiveRef.current)
    }, 500) 
  }, [])

  const handleRevoke = async (id) => {
    if (!confirm("Are you sure you want to revoke this consent?")) return
    try {
      await revokeConsent(id)
      await fetchData() // Refresh list to see the revoked status
    } catch (err) {
      alert("Failed to revoke consent.")
    }
  }

  const handleGrant = async () => {
    if (!selectedGrantee) return alert("Please select a doctor or hospital")
    
    try {
      setSubmitting(true)
      const payload = {
          grantee_user_id: selectedGrantee.user_id,
          grantee_role: "doctor", // For now, we only show doctors in the search
          access_level: accessLevel,
          record_types_allowed: recordTypes,
          expires_at: expiryDate || null
      }
      await grantConsent(payload)
      await fetchData()
      setGrantOpen(false)
      setSelectedGrantee(null)
    } catch (err) {
      alert("Failed to grant consent.")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDoctors = doctors.filter(d => 
    d.full_name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  )

  const ConsentCard = ({ consent }) => (
    <div className="glass-card card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{consent.grantee_name || "Medical Provider"}</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={consent.grantee_role} />
            <StatusBadge status={consent.status} />
            <StatusBadge status={consent.access_level} />
          </div>
        </div>
        {consent.status === "active" && (
          <button className="btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleRevoke(consent.id)}>
            <ShieldOff size={14} /> Revoke
          </button>
        )}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
        <p>Records: {consent.record_types_allowed?.map(t => t.replace(/_/g, " ")).join(", ") || "None selected"}</p>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>Granted: {consent.granted_at?.split("T")[0]}</span>
        {consent.expires_at && <span> · Expires: {consent.expires_at.split("T")[0]}</span>}
        {consent.revoked_at && <span> · Revoked: {consent.revoked_at.split("T")[0]}</span>}
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Consent Management" description="Control who can access your medical records">
        <button className="btn-primary" onClick={() => setGrantOpen(true)}><Plus size={16} /> Grant Access</button>
      </PageHeader>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
           <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--error)" }}>
           {error}
           <button onClick={fetchData} className="btn-ghost" style={{ display: "block", margin: "16px auto" }}>Retry</button>
        </div>
      ) : (
        <>
            <div ref={activeRef}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--success)" }}>
                🟢 Active Consents ({active.length})
                </h3>
                {active.length === 0 ? (
                <EmptyState icon={Shield} title="No active consents" description="Grant access to a doctor or hospital" />
                ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 12, marginBottom: 32 }}>
                    {active.map(c => <ConsentCard key={c.id} consent={c} />)}
                </div>
                )}
            </div>

            {inactive.length > 0 && (
                <div ref={inactiveRef}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-muted)" }}>
                    Revoked / Expired ({inactive.length})
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 12, opacity: 0.6 }}>
                    {inactive.map(c => <ConsentCard key={c.id} consent={c} />)}
                </div>
                </div>
            )}
        </>
      )}

      {grantOpen && (
        <Modal title="Grant Access" onClose={() => setGrantOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search Doctor or Hospital</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="Search by name..." style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, maxHeight: 150, overflowY: "auto", padding: 4 }}>
              {filteredDoctors.length === 0 ? <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)" }}>No providers found</p> : 
               filteredDoctors.map(d => (
                <label key={d.id} style={{ 
                    display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, 
                    border: selectedGrantee?.id === d.id ? "2px solid var(--accent)" : "1px solid var(--border-default)", 
                    cursor: "pointer", background: selectedGrantee?.id === d.id ? "var(--glass-light)" : "transparent"
                }}>
                  <input type="radio" name="grantee" checked={selectedGrantee?.id === d.id} onChange={() => setSelectedGrantee(d)} />
                  <div><p style={{ fontWeight: 500, fontSize: 14 }}>{d.full_name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.specialization}</p></div>
                </label>
              ))}
            </div>
            <div>
                <label className="input-label">Access Level</label>
                <select className="input" value={accessLevel} onChange={e => setAccessLevel(e.target.value)}>
                    <option value="read_only">Read Only</option>
                    <option value="full">Full Access</option>
                </select>
            </div>
            <div>
                <label className="input-label">Record Types (multiple)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["lab_report", "prescription", "scan", "discharge"].map(t => (
                        <button key={t} className={`badge ${recordTypes.includes(t) ? "badge-accent" : ""}`}
                                style={{ border: recordTypes.includes(t) ? "none" : "1px solid var(--border-subtle)", cursor: "pointer", background: recordTypes.includes(t) ? "var(--accent)" : "transparent" }}
                                onClick={() => setRecordTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}>
                            {t.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>
            </div>
            <div><label className="input-label">Expiry Date (optional)</label><input className="input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setGrantOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleGrant} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Grant Access"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Consents
