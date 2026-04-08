import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockDoctors } from "@/data/mockData"
import { Stethoscope, Plus, Trash2, Search } from "lucide-react"

const Doctors = () => {
  const [doctors, setDoctors] = useState(mockDoctors.filter(d => d.hospital_id === "h1"))
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  return (
    <DashboardLayout>
      <PageHeader title="Doctors" description="Manage affiliated doctors">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Doctor</button>
      </PageHeader>

      {doctors.length === 0 ? <EmptyState icon={Stethoscope} title="No doctors" description="Add your first doctor" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {doctors.map(doc => (
            <div key={doc.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{doc.full_name}</h3>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatusBadge status={doc.is_available ? "active" : "inactive"} />
                    <span className="badge badge-info">{doc.specialization}</span>
                  </div>
                </div>
                <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }}
                  onClick={() => setDoctors(ds => ds.filter(d => d.id !== doc.id))}><Trash2 size={14} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginTop: 12 }}>
                <div><span className="input-label" style={{ marginBottom: 2 }}>License</span><p style={{ fontFamily: "var(--font-mono)" }}>{doc.license_number}</p></div>
                <div><span className="input-label" style={{ marginBottom: 2 }}>Department</span><p>{doc.department || "—"}</p></div>
                <div><span className="input-label" style={{ marginBottom: 2 }}>Experience</span><p>{doc.years_experience} years</p></div>
                <div><span className="input-label" style={{ marginBottom: 2 }}>Fee</span><p style={{ color: "var(--accent)", fontWeight: 600 }}>₹{doc.consultation_fee}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <Modal title="Add Doctor to Hospital" onClose={() => setAddOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search by License Number or Email</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="e.g. MH-12345 or doctor@email.com" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <p style={{ fontWeight: 600 }}>Dr. Example Name</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Neurologist · MH-99999</p>
            </div>
            <div><label className="input-label">Department (optional)</label><input className="input" placeholder="e.g. Cardiology" /></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setAddOpen(false)}>Add Doctor</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Doctors
