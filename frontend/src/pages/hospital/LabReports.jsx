import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockRecords, mockPatients } from "@/data/mockData"
import { TestTube, Upload, Search } from "lucide-react"

const LabReports = () => {
  const labReports = mockRecords.filter(r => r.record_type === "lab_report")
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Lab Reports" description="Upload and manage lab reports for patients">
        <button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload Report</button>
      </PageHeader>

      {labReports.length === 0 ? <EmptyState icon={TestTube} title="No lab reports" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {labReports.map(rec => {
            const patient = mockPatients.find(p => p.id === rec.patient_id)
            return (
              <div key={rec.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{rec.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Patient: {patient?.full_name || "Unknown"}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{rec.description}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={rec.record_type} />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{rec.record_date}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{rec.file_name} · {(rec.file_size_bytes / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {uploadOpen && (
        <Modal title="Upload Lab Report" onClose={() => setUploadOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search Patient</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="Search by patient name or ID..." style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div><label className="input-label">Title</label><input className="input" placeholder="e.g. Complete Blood Count — Jan 2025" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Report Type</label>
                <select className="input"><option>lab_report</option><option>scan</option><option>other</option></select></div>
              <div><label className="input-label">Report Date</label><input className="input" type="date" /></div>
            </div>
            <div><label className="input-label">Description</label><textarea className="input" placeholder="e.g. Ordered by Dr. Mehta, Cardiology dept." /></div>
            <div><label className="input-label">File (PDF, JPG, PNG — Max 20MB)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" style={{ padding: 8 }} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setUploadOpen(false)}><Upload size={16} /> Upload</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default LabReports
