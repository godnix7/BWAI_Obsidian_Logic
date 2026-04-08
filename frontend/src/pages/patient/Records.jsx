import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { getRecords, uploadRecord, getRecordUrl, deleteRecord } from "@/api/Patient.api"
import { Upload, FileText, Eye, Download, Trash2, Search, Loader2 } from "lucide-react"

const API_BASE = "http://127.0.0.1:8002"

const Records = () => {
  const today = new Date().toISOString().split("T")[0]
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(null)
  
  // Upload State
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadType, setUploadType] = useState("lab_report")
  const [uploadDate, setUploadDate] = useState(today)
  const [uploadEmergency, setUploadEmergency] = useState("false")
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const gridRef = useRef(null)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await getRecords()
      setRecords(res.data)
    } catch (err) {
      console.error("Failed to fetch records:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    pageEnter(); 
    fetchRecords();
    setTimeout(() => {
      cardStagger(".record-card")
      if (gridRef.current) scrollReveal(gridRef.current)
    }, 100) 
  }, [])

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return
    setUploadLoading(true)
    const formData = new FormData()
    formData.append("file", uploadFile)
    formData.append("title", uploadTitle)
    formData.append("record_type", uploadType)
    formData.append("record_date", uploadDate || today)
    formData.append("is_emergency_visible", uploadEmergency)

    try {
      await uploadRecord(formData)
      setUploadOpen(false)
      fetchRecords()
      // Reset
      setUploadTitle("")
      setUploadDate(today)
      setUploadFile(null)
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Failed to upload record. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  const handlePreview = async (rec) => {
    try {
        const res = await getRecordUrl(rec.id)
        const url = res.data.url?.startsWith("http") ? res.data.url : `${API_BASE}${res.data.url}`
        window.open(url, '_blank')
    } catch (err) {
        console.error("Preview failed:", err)
        alert("Could not generate preview link.")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    try {
      await deleteRecord(id)
      await fetchRecords()
    } catch (err) {
      console.error("Delete failed:", err)
      alert("Failed to delete record.")
    }
  }

  const filtered = records.filter(r => {
    if (filter !== "all" && r.record_type !== filter) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const typeColors = { lab_report: "var(--violet)", prescription: "var(--warning)", scan: "var(--success)", discharge: "var(--info)", other: "var(--accent)" }

  return (
    <DashboardLayout>
      <PageHeader title="Medical Records" description="Upload, view, and manage your health records">
        <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload Record</button>
      </PageHeader>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
          <input className="input" placeholder="Search records..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }} />
        </div>
        <div className="tab-bar">
          {["all", "lab_report", "prescription", "scan", "discharge"].map(t => (
            <button key={t} className={`tab-item ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)} style={{ textTransform: "capitalize", fontSize: 12 }}>
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2 className="animate-spin" size={40} color="var(--accent)" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No records found" description="Upload your first medical record" />
      ) : (
        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(rec => (
            <div key={rec.id} className="glass-card record-card card" style={{
              padding: 20, cursor: "pointer",
              borderLeft: `3px solid ${typeColors[rec.record_type] || "var(--accent)"}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15 }}>{rec.title}</h3>
                <StatusBadge status={rec.record_type} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>{rec.description || "No description provided"}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{rec.record_date}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => handlePreview(rec)} title="View"><Eye size={15} /></button>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => handleDelete(rec.id)}><Trash2 size={15} /></button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                {rec.file_name} · {(rec.file_size_bytes / 1024).toFixed(0)} KB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <Modal title="Upload Medical Record" onClose={() => setUploadOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Title</label><input className="input" placeholder="e.g. CBC Blood Test" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} /></div>
            <div><label className="input-label">Record Type</label>
              <select className="input" value={uploadType} onChange={e => setUploadType(e.target.value)}>
                <option value="lab_report">Lab Report</option><option value="prescription">Prescription</option>
                <option value="scan">Scan / Imaging</option><option value="discharge">Discharge Summary</option><option value="other">Other</option></select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Record Date</label><input className="input" type="date" value={uploadDate} onChange={e => setUploadDate(e.target.value)} /></div>
              <div><label className="input-label">Emergency Visible</label>
                <select className="input" value={uploadEmergency} onChange={e => setUploadEmergency(e.target.value)}><option value="false">No</option><option value="true">Yes</option></select></div>
            </div>
            <div><label className="input-label">File (PDF, JPG, PNG — Max 20MB)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" style={{ padding: 8 }} onChange={e => setUploadFile(e.target.files[0])} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={uploadLoading || !uploadFile || !uploadTitle}>
                {uploadLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} 
                {uploadLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Records
