import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { mockConsents, mockDoctors } from "@/data/mockData"
import { Shield, Plus, ShieldOff, Search } from "lucide-react"

const Consents = () => {
  const [consents, setConsents] = useState(mockConsents)
  const [grantOpen, setGrantOpen] = useState(false)
  const active = consents.filter(c => c.status === "active")
  const inactive = consents.filter(c => c.status !== "active")

  const activeRef = useRef(null)
  const inactiveRef = useRef(null)

  useEffect(() => { 
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (activeRef.current) scrollReveal(activeRef.current)
      if (inactiveRef.current) scrollReveal(inactiveRef.current)
    }, 100) 
  }, [])

  const revoke = (id) => setConsents(cs => cs.map(c => c.id === id ? { ...c, status: "revoked", revoked_at: new Date().toISOString() } : c))

  const ConsentCard = ({ consent }) => (
    <div className="glass-card card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{consent.grantee.full_name}</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={consent.grantee_role} />
            <StatusBadge status={consent.status} />
            <StatusBadge status={consent.access_level} />
          </div>
        </div>
        {consent.status === "active" && (
          <button className="btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => revoke(consent.id)}>
            <ShieldOff size={14} /> Revoke
          </button>
        )}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
        <p>Records: {consent.record_types_allowed.map(t => t.replace(/_/g, " ")).join(", ")}</p>
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

      {grantOpen && (
        <Modal title="Grant Access" onClose={() => setGrantOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search Doctor or Hospital</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="Search by name..." style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {mockDoctors.slice(0, 3).map(d => (
                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, border: "1px solid var(--border-default)", cursor: "pointer" }}>
                  <input type="radio" name="grantee" />
                  <div><p style={{ fontWeight: 500, fontSize: 14 }}>{d.full_name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.specialization}</p></div>
                </label>
              ))}
            </div>
            <div><label className="input-label">Access Level</label>
              <select className="input"><option value="read_only">Read Only</option><option value="full">Full Access</option></select></div>
            <div><label className="input-label">Record Types (hold Ctrl to select multiple)</label>
              <select className="input" multiple style={{ minHeight: 100 }}>
                <option value="lab_report">Lab Report</option><option value="prescription">Prescription</option>
                <option value="scan">Scan</option><option value="discharge">Discharge</option></select></div>
            <div><label className="input-label">Expiry Date (optional)</label><input className="input" type="date" /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setGrantOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setGrantOpen(false)}>Grant Access</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Consents
