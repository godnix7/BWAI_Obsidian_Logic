import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { ShieldCheck, Plus, Trash2, Loader2, FileText } from "lucide-react"
import { getInsurance, addInsurance, deleteInsurance, uploadInsuranceDoc } from "@/api/Patient.api"

const API_BASE = "http://127.0.0.1:8002"

const Insurance = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    provider_name: "",
    policy_number: "",
    policy_type: "health",
    valid_from: "",
    valid_until: "",
    coverage_amount: 500000
  })
  const [file, setFile] = useState(null)
  
  const gridRef = useRef(null)
  const resolveUrl = (url) => url?.startsWith("http") ? url : `${API_BASE}${url}`

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await getInsurance()
      setRecords(res.data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch insurance:", err)
      setError("Failed to load insurance records.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchRecords()
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (gridRef.current) scrollReveal(gridRef.current)
    }, 500) 
  }, [])

  const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000)

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this insurance record?")) return
    try {
      await deleteInsurance(id)
      setRecords(r => r.filter(x => x.id !== id))
    } catch (err) {
      alert("Failed to delete record.")
    }
  }

  const handleSubmit = async () => {
    if (!formData.provider_name || !formData.policy_number) return alert("Please fill mandatory fields")
    
    try {
      setSubmitting(true)
      const res = await addInsurance(formData)
      
      if (file) {
        const fileData = new FormData()
        fileData.append("file", file)
        await uploadInsuranceDoc(res.data.id, fileData)
      }
      
      await fetchRecords()
      setAddOpen(false)
      setFormData({ provider_name: "", policy_number: "", policy_type: "health", valid_from: "", valid_until: "", coverage_amount: 500000 })
      setFile(null)
    } catch (err) {
      alert("Failed to add insurance.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Insurance" description="Manage your insurance policies">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Policy</button>
      </PageHeader>

      {loading ? (
         <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
           <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
         </div>
      ) : error ? (
         <div className="glass-card" style={{ padding: 40, textAlign: "center", color: "var(--error)" }}>
           {error}
           <button onClick={fetchRecords} className="btn-ghost" style={{ display: "block", margin: "16px auto" }}>Retry</button>
         </div>
      ) : records.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No insurance records" description="You haven't added any insurance policies yet." />
      ) : (
        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {records.map(ins => {
            const expDays = daysUntil(ins.valid_until)
            return (
              <div key={ins.id} className="glass-card card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{ins.provider_name}</h3>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <StatusBadge status={ins.is_active ? "active" : "expired"} />
                      <StatusBadge status={ins.policy_type} />
                      {expDays > 0 && expDays < 30 && <span className="badge badge-warning">Expires in {expDays}d</span>}
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => handleDelete(ins.id)}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Policy No.</label>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{ins.policy_number}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Coverage</label>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>₹{Number(ins.coverage_amount).toLocaleString()}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Valid From</label>
                    <span>{ins.valid_from}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Valid Until</label>
                    <span>{ins.valid_until}</span></div>
                </div>
                {ins.document_url && (
                    <a href={resolveUrl(ins.document_url)} target="_blank" rel="noreferrer" 
                       className="btn-ghost" style={{ marginTop: 16, width: "100%", justifyContent: "center", fontSize: 12 }}>
                        <FileText size={14} style={{ marginRight: 6 }} /> View Document
                    </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {addOpen && (
        <Modal title="Add Insurance Policy" onClose={() => setAddOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
                <label className="input-label">Provider Name</label>
                <input className="input" placeholder="e.g. Star Health Insurance" value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                  <label className="input-label">Policy Number</label>
                  <input className="input" placeholder="SHI-2025-XXXXX" value={formData.policy_number} onChange={e => setFormData({...formData, policy_number: e.target.value})} />
              </div>
              <div>
                  <label className="input-label">Policy Type</label>
                  <select className="input" value={formData.policy_type} onChange={e => setFormData({...formData, policy_type: e.target.value})}>
                    <option>health</option>
                    <option>dental</option>
                    <option>vision</option>
                  </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                  <label className="input-label">Valid From</label>
                  <input className="input" type="date" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} />
              </div>
              <div>
                  <label className="input-label">Valid Until</label>
                  <input className="input" type="date" value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} />
              </div>
              <div>
                  <label className="input-label">Coverage (₹)</label>
                  <input className="input" type="number" placeholder="500000" value={formData.coverage_amount} onChange={e => setFormData({...formData, coverage_amount: e.target.value})} />
              </div>
            </div>
            <div>
                <label className="input-label">Policy Document (PDF)</label>
                <input type="file" accept=".pdf" className="input" style={{ padding: 8 }} onChange={e => setFile(e.target.files[0])} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Add Policy"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Insurance
