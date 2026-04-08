import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockInsurance } from "@/data/mockData"
import { ShieldCheck, Plus, Trash2 } from "lucide-react"

const Insurance = () => {
  const [records, setRecords] = useState(mockInsurance)
  const [addOpen, setAddOpen] = useState(false)
  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000)

  return (
    <DashboardLayout>
      <PageHeader title="Insurance" description="Manage your insurance policies">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Policy</button>
      </PageHeader>

      {records.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No insurance records" description="Add your insurance policies" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
          {records.map(ins => {
            const expDays = daysUntil(ins.valid_until)
            return (
              <div key={ins.id} className="glass-card card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{ins.provider_name}</h3>
                    <div style={{ display: "flex", gap: 6 }}>
                      <StatusBadge status={ins.is_active ? "active" : "expired"} />
                      <StatusBadge status={ins.policy_type} />
                      {expDays > 0 && expDays < 30 && <span className="badge badge-warning">Expires in {expDays}d</span>}
                    </div>
                  </div>
                  <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                    onClick={() => setRecords(r => r.filter(x => x.id !== ins.id))}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Policy No.</label>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{ins.policy_number}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Coverage</label>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>₹{(ins.coverage_amount).toLocaleString()}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Valid From</label>
                    <span>{ins.valid_from}</span></div>
                  <div><label className="input-label" style={{ marginBottom: 2 }}>Valid Until</label>
                    <span>{ins.valid_until}</span></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {addOpen && (
        <Modal title="Add Insurance Policy" onClose={() => setAddOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Provider Name</label><input className="input" placeholder="e.g. Star Health Insurance" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Policy Number</label><input className="input" placeholder="SHI-2025-XXXXX" /></div>
              <div><label className="input-label">Policy Type</label>
                <select className="input"><option>health</option><option>dental</option><option>vision</option></select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Valid From</label><input className="input" type="date" /></div>
              <div><label className="input-label">Valid Until</label><input className="input" type="date" /></div>
              <div><label className="input-label">Coverage (₹)</label><input className="input" type="number" placeholder="500000" /></div>
            </div>
            <div><label className="input-label">Policy Document (PDF)</label><input type="file" accept=".pdf" className="input" style={{ padding: 8 }} /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setAddOpen(false)}>Add Policy</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Insurance
