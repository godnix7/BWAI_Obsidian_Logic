import { useEffect, useRef, useState } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import { resolveEmergencyQR } from "@/api/Hospital.api"
import { AlertCircle, Camera, Loader2, QrCode, Search, ShieldAlert, Upload, XCircle } from "lucide-react"
import jsQR from "jsqr"

const API_BASE = `http://${window.location.hostname}:8002`

const EmergencyAccess = () => {
  const [payload, setPayload] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [scannerSupported, setScannerSupported] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const frameRef = useRef(null)
  const detectorRef = useRef(null)
  const canvasRef = useRef(null)

  const resolveUrl = (url) => url?.startsWith("http") ? url : `${API_BASE}${url}`

  useEffect(() => {
    const supported = typeof window !== "undefined" && "BarcodeDetector" in window
    setScannerSupported(supported)

    if (supported) {
      detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] })
    }

    return () => stopScanner()
  }, [])

  const stopScanner = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScannerActive(false)
  }

  const loadEmergencyData = async (incomingPayload) => {
    const value = incomingPayload?.trim()
    if (!value) {
      setError("Scan, upload, or paste a QR payload first.")
      return
    }

    try {
      setLoading(true)
      setError("")
      const response = await resolveEmergencyQR(value)
      setPayload(value)
      setResult(response.data)
      stopScanner()
    } catch (err) {
      setResult(null)
      setError(err?.response?.data?.detail || "Unable to access emergency QR data.")
    } finally {
      setLoading(false)
    }
  }

  const scanFrame = async () => {
    if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      const fallbackHit = readQrFromVideoFrame()
      if (fallbackHit) {
        await loadEmergencyData(fallbackHit)
        return
      }
      frameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    try {
      const codes = await detectorRef.current.detect(videoRef.current)
      const hit = codes?.[0]?.rawValue
      if (hit) {
        await loadEmergencyData(hit)
        return
      }
    } catch (err) {
      const fallbackHit = readQrFromVideoFrame()
      if (fallbackHit) {
        await loadEmergencyData(fallbackHit)
        return
      }
    }

    frameRef.current = requestAnimationFrame(scanFrame)
  }

  const readQrFromVideoFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return null
    }

    const context = canvas.getContext("2d", { willReadFrequently: true })
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    return code?.data || null
  }

  const readQrFromBitmap = async (file) => {
    const image = await createImageBitmap(file)
    const canvas = canvasRef.current
    if (!canvas) {
      throw new Error("QR decoder canvas is unavailable.")
    }

    const context = canvas.getContext("2d", { willReadFrequently: true })
    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    if (detectorRef.current) {
      const nativeCodes = await detectorRef.current.detect(canvas)
      const nativeHit = nativeCodes?.[0]?.rawValue
      if (nativeHit) {
        return nativeHit
      }
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const jsqrHit = jsQR(imageData.data, imageData.width, imageData.height)?.data
    if (jsqrHit) {
      return jsqrHit
    }

    throw new Error("No QR code found in the uploaded image.")
  }

  const startScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support camera access for live QR scanning.")
      return
    }

    try {
      setCameraError("")
      setError("")
      setResult(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScannerActive(true)
      frameRef.current = requestAnimationFrame(scanFrame)
    } catch (err) {
      setCameraError("Camera access was denied or is unavailable on this device.")
      stopScanner()
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    try {
      setLoading(true)
      setError("")
      setResult(null)
      const hit = await readQrFromBitmap(file)
      await loadEmergencyData(hit)
    } catch (err) {
      setError(err?.message || "Could not read the uploaded QR image.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Emergency QR Access"
        description="Hospital-only emergency lookup. Scan a patient's MediLocker QR or upload the QR image to view emergency-safe data."
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: 24 }}>
        <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 8 }}>Scan Or Upload</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
              The patient QR now contains a secure MediLocker payload, not a public link. Only authenticated hospital users can resolve it.
            </p>
            {!scannerSupported ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 8 }}>
                Native QR detection is unavailable here, so MediLocker will use its built-in fallback decoder for camera and upload.
              </p>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={scannerActive ? stopScanner : startScanner}>
              <Camera size={16} />
              {scannerActive ? "Stop Camera" : "Start Scan"}
            </button>
            <label className="btn-secondary" style={{ cursor: "pointer" }}>
              <Upload size={16} />
              Upload QR
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{
            minHeight: 240,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
            {scannerActive ? (
              <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: 24 }}>
                <QrCode size={42} style={{ marginBottom: 12, opacity: 0.7 }} />
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Ready for emergency scan</p>
                <p style={{ fontSize: 12 }}>
                  Use a camera scan, upload the QR image, or paste the payload below.
                </p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {cameraError ? (
            <div className="glass-card" style={{ padding: 14, border: "1px solid rgba(245, 158, 11, 0.35)" }}>
              <p style={{ color: "var(--warning)", fontSize: 13 }}>{cameraError}</p>
            </div>
          ) : null}

          <div>
            <label className="input-label">Manual QR Payload</label>
            <textarea
              className="input-modern"
              rows={4}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="Paste the scanned MediLocker QR payload here if camera/upload is unavailable."
            />
            <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => loadEmergencyData(payload)}>
              <Search size={16} />
              Resolve Payload
            </button>
          </div>

          {error ? (
            <div className="glass-card" style={{ padding: 14, border: "1px solid rgba(239, 68, 68, 0.35)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertCircle size={16} color="var(--error)" style={{ marginTop: 2 }} />
                <p style={{ color: "var(--error)", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 6 }}>Emergency Data</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                Emergency-visible profile details plus patient-marked emergency records.
              </p>
            </div>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={20} color="var(--accent)" />}
          </div>

          {!result && !loading ? (
            <div style={{
              minHeight: 320,
              borderRadius: 18,
              border: "1px dashed var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "var(--text-secondary)",
              padding: 24
            }}>
              <div>
                <QrCode size={36} style={{ marginBottom: 12, opacity: 0.7 }} />
                <p style={{ fontWeight: 600, marginBottom: 6 }}>No patient loaded yet</p>
                <p style={{ fontSize: 13 }}>Resolve a hospital-authorized emergency QR to view the patient data here.</p>
              </div>
            </div>
          ) : null}

          {result ? (
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
                <InfoCard label="Patient Name" value={result.patient_name || "Hidden"} />
                <InfoCard label="Patient ID" value={result.patient_id || "N/A"} mono />
                <InfoCard label="Blood Group" value={result.blood_group || "Not shared"} accent />
                <InfoCard label="Gender" value={result.gender || "Not shared"} />
                <InfoCard label="Date of Birth" value={result.date_of_birth || "Not shared"} />
                <InfoCard
                  label="Emergency Contact"
                  value={result.emergency_contact ? `${result.emergency_contact.name || "N/A"} - ${result.emergency_contact.phone || "N/A"}` : "Not shared"}
                />
              </div>

              <TagSection title="Allergies" items={result.allergies} emptyLabel="No allergy data shared" tone="warning" />
              <TagSection title="Chronic Conditions" items={result.chronic_conditions} emptyLabel="No chronic condition data shared" tone="error" />

              <div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Emergency Records</h4>
                {result.emergency_records?.length ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {result.emergency_records.map((record, index) => (
                      <div key={`${record.title}-${index}`} className="glass-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>{record.title}</p>
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{record.record_type.replace(/_/g, " ")}</p>
                        </div>
                        <a className="btn-ghost" href={resolveUrl(record.url)} target="_blank" rel="noreferrer">
                          Open Record
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card" style={{ padding: 18, color: "var(--text-secondary)" }}>
                    No emergency-visible records were attached to this patient.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}

const InfoCard = ({ label, value, mono = false, accent = false }) => (
  <div className="glass-card" style={{ padding: 16 }}>
    <p className="input-label" style={{ marginBottom: 8 }}>{label}</p>
    <p style={{
      margin: 0,
      fontWeight: 600,
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
      color: accent ? "var(--error)" : "var(--text-primary)",
      wordBreak: "break-word"
    }}>
      {value}
    </p>
  </div>
)

const TagSection = ({ title, items, emptyLabel, tone }) => (
  <div>
    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{title}</h4>
    {items?.length ? (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {items.map((item) => (
          <span
            key={item}
            className={tone === "warning" ? "badge badge-warning" : "badge badge-error"}
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <div className="glass-card" style={{ padding: 16, color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <XCircle size={16} />
          <span>{emptyLabel}</span>
        </div>
      </div>
    )}
  </div>
)

export default EmergencyAccess
