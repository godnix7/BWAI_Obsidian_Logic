import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter, glowPulse } from "@/utils/animations"
import { mockPatients } from "@/data/mockData"
import { QrCode, Download, RefreshCw, Eye } from "lucide-react"

const EmergencyQR = () => {
  const patient = mockPatients[0]
  const qrRef = useRef(null)
  const [config, setConfig] = useState({ blood_group: true, allergies: true, emergency_contact: true, chronic_conditions: true })
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => { pageEnter() }, [])
  useEffect(() => { if (qrRef.current) glowPulse(qrRef.current) }, [])

  const toggle = (key) => setConfig(c => ({ ...c, [key]: !c[key] }))

  return (
    <DashboardLayout>
      <PageHeader title="Emergency QR Code" description="Generate a QR code with your emergency health information" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* QR Display */}
        <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div ref={qrRef} style={{
            width: 220, height: 220, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            background: "white", marginBottom: 24, boxShadow: "0 0 30px rgba(0,229,200,0.2)"
          }}>
            {/* Placeholder QR — replace with react-qr-code when integrating */}
            <div style={{ width: 180, height: 180, display: "grid", gridTemplateColumns: "repeat(9,1fr)", gridTemplateRows: "repeat(9,1fr)", gap: 2 }}>
              {Array.from({ length: 81 }).map((_, i) => (
                <div key={i} style={{
                  background: [0,1,2,6,7,8,9,18,27,36,45,54,63,72,73,74,78,79,80,17,26,35,44,53,62,71,10,12,14,16,20,24,28,32,40,48,56,60,64,68,70,30,50].includes(i) ? "#020811" : "transparent",
                  borderRadius: 1
                }} />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary"><Download size={16} /> Download QR</button>
            <button className="btn-secondary"><RefreshCw size={16} /> Regenerate</button>
          </div>

          <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} /> {showPreview ? "Hide" : "Show"} Scan Preview
          </button>
        </div>

        {/* Config */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            QR Visibility Settings
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
            Configure what information is visible when someone scans your QR code in an emergency.
          </p>

          {Object.entries(config).map(([key, val]) => (
            <label key={key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 10, marginBottom: 8,
              background: val ? "var(--accent-soft)" : "var(--glass-light)",
              border: `1px solid ${val ? "var(--border-accent)" : "var(--border-subtle)"}`,
              cursor: "pointer", transition: "all 0.2s"
            }} onClick={() => toggle(key)}>
              <span style={{ textTransform: "capitalize", fontWeight: 500, fontSize: 14 }}>
                {key.replace(/_/g, " ")}
              </span>
              <div style={{
                width: 40, height: 22, borderRadius: 11, position: "relative",
                background: val ? "var(--accent)" : "var(--glass-heavy)", transition: "background 0.2s"
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 9, background: "white",
                  position: "absolute", top: 2, left: val ? 20 : 2, transition: "left 0.2s"
                }} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Scan Preview */}
      {showPreview && (
        <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            🔍 What first responders will see:
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            {config.blood_group && <div style={{ padding: 12, borderRadius: 10, background: "var(--glass-light)" }}>
              <label className="input-label">Blood Group</label><p style={{ fontWeight: 600, color: "var(--error)" }}>{patient.blood_group}</p></div>}
            {config.allergies && <div style={{ padding: 12, borderRadius: 10, background: "var(--glass-light)" }}>
              <label className="input-label">Allergies</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {patient.allergies.map(a => <span key={a} className="badge badge-warning">{a}</span>)}</div></div>}
            {config.emergency_contact && <div style={{ padding: 12, borderRadius: 10, background: "var(--glass-light)" }}>
              <label className="input-label">Emergency Contact</label>
              <p>{patient.emergency_contact_name} — {patient.emergency_contact_phone}</p></div>}
            {config.chronic_conditions && <div style={{ padding: 12, borderRadius: 10, background: "var(--glass-light)" }}>
              <label className="input-label">Chronic Conditions</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {patient.chronic_conditions.map(c => <span key={c} className="badge badge-error">{c}</span>)}</div></div>}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default EmergencyQR
