import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { TestTube, Upload, Search, Loader2, FileText, CheckCircle } from "lucide-react"
import { uploadLabReport, getUploadedReports } from "@/api/Hospital.api"

const LabReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
      patient_id: "",
      title: "",
      record_date: new Date().toISOString().split("T")[0],
      description: ""
  })
  const [file, setFile] = useState(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await getUploadedReports()
      setReports(res.data)
    } catch (err) {
      console.error("Failed to fetch reports:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchReports()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const handleUpload = async () => {
      if (!formData.patient_id || !formData.title || !file) {
          return alert("Please fill mandatory fields and select a file")
      }

      try {
          setSubmitting(true)
          const data = new FormData()
          data.append("patient_id", formData.patient_id)
          data.append("title", formData.title)
          data.append("record_date", formData.record_date)
          data.append("description", formData.description)
          data.append("file", file)

          await uploadLabReport(data)
          setUploadSuccess(true)
          await fetchReports()
          setUploadOpen(false)
          setFormData({ patient_id: "", title: "", record_date: new Date().toISOString().split("T")[0], description: "" })
          setFile(null)
          setTimeout(() => setUploadSuccess(false), 3000)
      } catch (err) {
          const detail = err.response?.data?.detail || "Upload failed. Ensure you have patient consent."
          alert(detail)
      } finally {
          setSubmitting(false)
      }
  }

  if (loading) return (
      <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Lab Reports" description="Upload and manage lab reports for patients">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {uploadSuccess && <span style={{ color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={14}/> Uploaded!</span>}
            <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload Report</button>
        </div>
      </PageHeader>

      {reports.length === 0 ? <EmptyState icon={TestTube} title="No lab reports" description="Upload your first diagnosis report for an authorized patient." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map(rec => {
            return (
              <div key={rec.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ padding: 12, borderRadius: 12, background: "var(--bg-accent)", color: "var(--accent)" }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{rec.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                            Patient: <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{rec.patient_id}</span>
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{rec.description}</p>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status="lab_report" />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{rec.record_date}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{rec.file_name} · {(rec.file_size_bytes / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {uploadOpen && (
        <Modal title="Upload Lab Report" onClose={() => setUploadOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
                <label className="input-label">Patient ID</label>
                <div style={{ position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                    <input className="input" placeholder="Paste Patient UIID here..." style={{ paddingLeft: 36 }} value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} />
                </div>
                <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Note: You must have active consent from the patient.</p>
            </div>
            <div>
                <label className="input-label">Report Title</label>
                <input className="input" placeholder="e.g. Complete Blood Count — Jan 2025" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                  <label className="input-label">Report Type</label>
                  <select className="input" disabled><option>lab_report</option></select>
              </div>
              <div>
                  <label className="input-label">Report Date</label>
                  <input className="input" type="date" value={formData.record_date} onChange={e => setFormData({...formData, record_date: e.target.value})} />
              </div>
            </div>
            <div>
                <label className="input-label">Description / Remarks</label>
                <textarea className="input" placeholder="e.g. Ordered by Dr. Mehta, Cardiology dept." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
                <label className="input-label">Select Report File (PDF/Image)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" style={{ padding: 8 }} onChange={e => setFile(e.target.files[0])} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setUploadOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} 
                  Upload Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default LabReports
