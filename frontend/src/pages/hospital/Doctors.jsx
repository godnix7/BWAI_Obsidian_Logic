import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { Stethoscope, Plus, Trash2, Search, Loader2 } from "lucide-react"
import { getHospitalDoctors, addDoctorToHospital, removeDoctorFromHospital } from "@/api/Hospital.api"
import { getAvailableDoctors } from "@/api/Patient.api"

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [publicDoctors, setPublicDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")

  // New Doctor Association Form
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [department, setDepartment] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [hospDocsRes, publicDocsRes] = await Promise.all([
          getHospitalDoctors(),
          getAvailableDoctors()
      ])
      setDoctors(hospDocsRes.data || [])
      setPublicDoctors(publicDocsRes.data || [])
    } catch (err) {
      console.error("Failed to fetch hospital doctors:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const handleAdd = async () => {
      if (!selectedDoctor) return alert("Please select a doctor")
      try {
          setSubmitting(true)
          await addDoctorToHospital({
              doctor_id: selectedDoctor.id,
              department: department || "General"
          })
          await fetchData()
          setAddOpen(false)
          setSelectedDoctor(null)
          setDepartment("")
      } catch (err) {
          alert("Failed to add doctor.")
      } finally {
          setSubmitting(false)
      }
  }

  const handleRemove = async (doctorId) => {
      if (!confirm("Remove this doctor from the hospital?")) return
      try {
          await removeDoctorFromHospital(doctorId)
          await fetchData()
      } catch (err) {
          alert("Failed to remove doctor.")
      }
  }

  const filteredPublicDoctors = publicDoctors.filter(d => 
      !doctors.some(hd => hd.id === d.id) && // Only those not already in hospital
      ((d.full_name || "").toLowerCase().includes(search.toLowerCase()) || 
       (d.specialization || "").toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return (
      <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Doctors" description="Manage affiliated doctors">
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Doctor</button>
      </PageHeader>

      {doctors.length === 0 ? <EmptyState icon={Stethoscope} title="No doctors" description="Add your first doctor to manage appointments." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {doctors.map(doc => (
            <div key={doc.id} className="glass-card card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{doc.full_name}</h3>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="badge badge-accent" style={{ fontWeight: 700 }}>{doc.department}</span>
                    <span className="badge badge-info">{doc.specialization}</span>
                  </div>
                </div>
                <button className="btn-ghost" style={{ padding: 6, color: "var(--error)" }} onClick={() => handleRemove(doc.id)}>
                    <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
                <div><span className="input-label" style={{ marginBottom: 2 }}>Joined</span><p style={{ fontFamily: "var(--font-mono)" }}>{doc.joined_at?.split("T")[0]}</p></div>
                <div><span className="input-label" style={{ marginBottom: 2 }}>ID</span><p style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{doc.id.substring(0,8)}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <Modal title="Add Doctor to Hospital" onClose={() => setAddOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><label className="input-label">Search Registered Doctors</label>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
                <input className="input" placeholder="Search by name or specialization..." style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            
            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 4 }}>
                {filteredPublicDoctors.length === 0 ? <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)", padding: 12 }}>No doctors found</p> : 
                 filteredPublicDoctors.map(d => (
                    <label key={d.id} style={{ 
                        display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, cursor: "pointer",
                        border: selectedDoctor?.id === d.id ? "2px solid var(--accent)" : "1px solid var(--border-subtle)",
                        background: selectedDoctor?.id === d.id ? "var(--bg-accent)" : "transparent"
                    }}>
                        <input type="radio" checked={selectedDoctor?.id === d.id} onChange={() => setSelectedDoctor(d)} />
                        <div>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{d.full_name}</p>
                            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.specialization}</p>
                        </div>
                    </label>
                ))}
            </div>

            <div><label className="input-label">Department</label><input className="input" placeholder="e.g. Cardiology" value={department} onChange={e => setDepartment(e.target.value)} /></div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
              <button className="btn-ghost" onClick={() => setAddOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                Add Doctor
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Doctors
