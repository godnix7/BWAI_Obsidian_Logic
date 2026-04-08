import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { pageEnter, glowPulse } from "@/utils/animations"
import { QrCode, Download, RefreshCw, Eye, Loader2, AlertCircle } from "lucide-react"
import { getQRConfig, updateQRConfig, regenerateQR, getProfile } from "@/api/Patient.api"

const API_BASE = `http://${window.location.hostname}:8002`

const EmergencyQR = () => {
  const [patient, setPatient] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const fieldLabels = {
    show_name: "Full Name",
    show_gender: "Gender",
    show_dob: "Date of Birth",
    show_blood_group: "Blood Group",
    show_allergies: "Allergies",
    show_emergency_contact: "Emergency Contact",
    show_chronic_conditions: "Chronic Conditions"
  }

  const qrRef = useRef(null)
  const resolveUrl = (url) => url?.startsWith("http") ? url : `${API_BASE}${url}`

  const fetchData = async () => {
    try {
      setLoading(true)
      const [configRes, profileRes] = await Promise.all([
          getQRConfig(),
          getProfile()
      ])
      setQrData(configRes.data)
      setPatient(profileRes.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch QR data:", err)
      setError("Failed to load emergency QR configuration.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter() 
  }, [])

  useEffect(() => { if (qrRef.current && qrData?.qr_code_url) glowPulse(qrRef.current) }, [qrData])

  const handleToggle = async (key) => {
    const newConfig = { ...qrData.config, [key]: !qrData.config[key] }
    setQrData({ ...qrData, config: newConfig })
    
    try {
        await updateQRConfig(newConfig)
    } catch (err) {
        console.error("Failed to update QR config:", err)
        alert("Failed to save configuration.")
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      const res = await regenerateQR()
      setQrData(res.data)
    } catch (err) {
      alert("Failed to regenerate QR code.")
    } finally {
      setRegenerating(false)
    }
  }

  const downloadQR = async () => {
      if (!qrData?.qr_code_url) return
      try {
        const response = await fetch(resolveUrl(qrData.qr_code_url))
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objectUrl
        link.download = "MediLocker_Emergency_QR.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(objectUrl)
      } catch (err) {
        console.error("Failed to download QR code:", err)
        window.open(resolveUrl(qrData.qr_code_url), "_blank", "noopener,noreferrer")
      }
  }

  if (loading) return (
    <DashboardLayout>
       <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Emergency QR Code" description="Generate a QR code with your emergency health information" />

      {error ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--error)" }}>
            <AlertCircle size={32} style={{ margin: "0 auto 16px" }} />
            <p>{error}</p>
            <button onClick={fetchData} className="btn-ghost" style={{ marginTop: 16 }}>Retry</button>
          </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {/* QR Display */}
            <div className="glass-card" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={qrRef} style={{
                width: 240, height: 240, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                background: "white", marginBottom: 24, boxShadow: "0 0 30px rgba(0,229,200,0.2)", overflow: "hidden"
            }}>
                {qrData?.qr_code_url ? (
                    <img src={`${resolveUrl(qrData.qr_code_url)}?t=${Date.now()}`} 
                         alt="Emergency QR" 
                         style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                        <QrCode size={48} style={{ opacity: 0.2, marginBottom: 8 }} />
                        <p>No QR Generated</p>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={downloadQR} disabled={!qrData?.qr_code_url}>
                    <Download size={16} /> Download QR
                </button>
                <button className="btn-secondary" onClick={handleRegenerate} disabled={regenerating}>
                    {regenerating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />} 
                    Regenerate
                </button>
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

            {Object.entries(qrData?.config || {}).map(([key, val]) => (
                <label key={key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: 10, marginBottom: 8,
                background: val ? "var(--bg-accent)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${val ? "var(--accent)" : "var(--border-subtle)"}`,
                cursor: "pointer", transition: "all 0.2s"
                }} onClick={() => handleToggle(key)}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>
                    {fieldLabels[key] || key.replace(/_/g, " ")}
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
      )}

      {/* Scan Preview */}
      {showPreview && patient && (
        <div className="glass-card" style={{ padding: 24, marginTop: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            🔍 What first responders will see:
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, fontSize: 14 }}>
            {qrData?.config?.show_name && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Patient Name</label><p style={{ fontWeight: 600 }}>{patient.full_name || "N/A"}</p></div>}

            {qrData?.config?.show_gender && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Gender</label><p style={{ fontWeight: 600, textTransform: "capitalize" }}>{patient.gender || "N/A"}</p></div>}

            {qrData?.config?.show_dob && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Date of Birth</label><p style={{ fontWeight: 600 }}>{patient.date_of_birth || "N/A"}</p></div>}

            {qrData?.config?.show_blood_group && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Blood Group</label><p style={{ fontWeight: 600, color: "var(--error)" }}>{patient.blood_group || "Unknown"}</p></div>}
            
            {qrData?.config?.show_allergies && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Allergies</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {patient.allergies?.length > 0 ? patient.allergies.map(a => <span key={a} className="badge badge-warning" style={{ fontSize: 10 }}>{a}</span>) : "None recorded"}</div></div>}
            
            {qrData?.config?.show_emergency_contact && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Emergency Contact</label>
              <p>{patient.emergency_contact_name || "N/A"} — {patient.emergency_contact_phone || "N/A"}</p></div>}
            
            {qrData?.config?.show_chronic_conditions && <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <label className="input-label">Chronic Conditions</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {patient.chronic_conditions?.length > 0 ? patient.chronic_conditions.map(c => <span key={c} className="badge badge-error" style={{ fontSize: 10 }}>{c}</span>) : "None recorded"}</div></div>}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default EmergencyQR
