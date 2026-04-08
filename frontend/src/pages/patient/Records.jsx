import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockRecords } from "@/data/mockData"
import { Upload, FileText, Eye, Download, Trash2, Search } from "lucide-react"

const Records = () => {
  const [records, setRecords] = useState(mockRecords.filter(r => r.patient_id === "p1"))
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(null)

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(".record-card"), 100) }, [])

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

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No records found" description="Upload your first medical record" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(rec => (
            <div key={rec.id} className="glass-card record-card" style={{
              padding: 20, cursor: "pointer", transition: "transform 0.25s, border-color 0.25s, box-shadow 0.25s",
              borderLeft: `3px solid ${typeColors[rec.record_type] || "var(--accent)"}`
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-card), var(--shadow-glow)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15 }}>{rec.title}</h3>
                <StatusBadge status={rec.record_type} />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>{rec.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{rec.record_date}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setPreviewOpen(rec)}><Eye size={15} /></button>
                  <button className="btn-ghost" style={{ padding: 6 }}><Download size={15} /></button>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => setRecords(r => r.filter(x => x.id !== rec.id))}><Trash2 size={15} /></button>
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
            <div><label className="input-label">Title</label><input className="input" placeholder="e.g. CBC Blood Test — Jan 2025" /></div>
            <div><label className="input-label">Record Type</label>
              <select className="input"><option value="lab_report">Lab Report</option><option value="prescription">Prescription</option>
                <option value="scan">Scan / Imaging</option><option value="discharge">Discharge Summary</option><option value="other">Other</option></select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Record Date</label><input className="input" type="date" /></div>
              <div><label className="input-label">Emergency Visible</label>
                <select className="input"><option value="false">No</option><option value="true">Yes</option></select></div>
            </div>
            <div><label className="input-label">Description</label><textarea className="input" placeholder="Optional notes..." /></div>
            <div><label className="input-label">File (PDF, JPG, PNG — Max 20MB)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" style={{ padding: 8 }} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setUploadOpen(false)}><Upload size={16} /> Upload</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <Modal title={previewOpen.title} onClose={() => setPreviewOpen(null)} wide>
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            <FileText size={48} strokeWidth={1} style={{ marginBottom: 16, color: "var(--text-muted)" }} />
            <p>Document preview would load here via presigned URL</p>
            <p style={{ fontSize: 12, marginTop: 8, fontFamily: "var(--font-mono)" }}>{previewOpen.file_name}</p>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Records