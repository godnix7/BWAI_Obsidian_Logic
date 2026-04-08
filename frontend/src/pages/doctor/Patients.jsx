import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { Users, ChevronDown, ChevronUp, FileText, Loader2, User as UserIcon, ClipboardPlus } from "lucide-react"
import { getDoctorPatients, getDoctorPatientRecords } from "@/api/Doctor.api"

const API_BASE = "http://127.0.0.1:8002"
const resolveUrl = (url) => url?.startsWith("http") ? url : `${API_BASE}${url}`

const Patients = () => {
  const [expanded, setExpanded] = useState(null)
  const [patients, setPatients] = useState([])
  const [recordsByPatient, setRecordsByPatient] = useState({})
  const [loadingRecordsFor, setLoadingRecordsFor] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getDoctorPatients()
      setPatients(res.data)
    } catch (err) {
      console.error("Failed to fetch doctor patients:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => cardStagger(), 500) 
  }, [])

  const handleToggle = async (consent) => {
      const isOpen = expanded === consent.consent_id
      setExpanded(isOpen ? null : consent.consent_id)

      if (isOpen || recordsByPatient[consent.patient?.id] || !consent.patient?.id) {
          return
      }

      try {
          setLoadingRecordsFor(consent.patient.id)
          const res = await getDoctorPatientRecords(consent.patient.id)
          setRecordsByPatient(current => ({
              ...current,
              [consent.patient.id]: res.data
          }))
      } catch (err) {
          alert(err.response?.data?.detail || "Could not load records for this patient.")
      } finally {
          setLoadingRecordsFor(null)
      }
  }

  if (loading) return (
      <DashboardLayout>
           <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="My Patients" description="Patients who have granted you data access" />

      {patients.length === 0 ? <EmptyState icon={Users} title="No consented patients" description="Patients will appear here when they grant you access in their Consents settings." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {patients.map(consent => {
            const patient = consent.patient
            if (!patient) return null
            const isOpen = expanded === consent.consent_id
            const records = recordsByPatient[patient.id] || []

            return (
              <div key={consent.consent_id} className="glass-card card" style={{ width: "100%" }}>
                <div className="card-inner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                    onClick={() => handleToggle(consent)}>
                    <div style={{ flex: 1, display: "flex", gap: 20, alignItems: "start" }}>
                      <div style={{ padding: 12, borderRadius: 12, background: "var(--bg-accent)", color: "var(--accent)" }}>
                          <UserIcon size={24} />
                      </div>
                      <div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <h3 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{patient.full_name}</h3>
                          <StatusBadge status={consent.access_level} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px", fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                          <span><strong>Blood Group:</strong> {patient.blood_group || "Unknown"}</span>
                          {consent.expires_at && <span><strong>Expires:</strong> {consent.expires_at.split("T")[0]}</span>}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {consent.record_types_allowed?.map(t => <StatusBadge key={t} status={t} />)}
                        </div>
                      </div>
                    </div>
                    <div style={{ paddingLeft: 24 }}>
                      {isOpen ? <ChevronUp size={24} color="var(--text-muted)" /> : <ChevronDown size={24} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: "2px solid var(--border-subtle)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 20, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
                        <div><span className="input-label">Gender</span><p style={{ fontWeight: 600 }}>{patient.gender || "-"}</p></div>
                        <div><span className="input-label">DOB</span><p style={{ fontWeight: 600 }}>{patient.date_of_birth || "-"}</p></div>
                        <div>
                          <span className="input-label">Allergies</span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                            {patient.allergies?.length > 0 ? patient.allergies.map(a => <span key={a} className="badge badge-warning">{a}</span>) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>None</span>}
                          </div>
                        </div>
                        <div>
                          <span className="input-label">Chronic Conditions</span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                            {patient.chronic_conditions?.length > 0 ? patient.chronic_conditions.map(c => <span key={c} className="badge badge-accent">{c}</span>) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>None</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                          <div className="glass-card" style={{ padding: 16, background: "var(--glass-light)", textAlign: "center" }}>
                              <FileText size={20} style={{ margin: "0 auto 10px", color: "var(--accent)" }} />
                              <p style={{ fontSize: 13, fontWeight: 600 }}>Approved Records</p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{records.length} files available to view</p>
                          </div>
                          <div className="glass-card" style={{ padding: 16, background: "var(--glass-light)", textAlign: "center" }}>
                              <ClipboardPlus size={20} style={{ margin: "0 auto 10px", color: "var(--success)" }} />
                              <p style={{ fontSize: 13, fontWeight: 600 }}>Issue Prescription</p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Use the Prescriptions screen for this patient</p>
                          </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                         <p className="input-label" style={{ margin: 0 }}>Accessible Records</p>
                         <p style={{ fontSize: 11, color: "var(--text-muted)" }}>UIID: {patient.id}</p>
                      </div>

                      {loadingRecordsFor === patient.id ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}><Loader2 className="animate-spin" size={24} /></div>
                      ) : records.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No records are currently available under this consent.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {records.map(record => (
                            <div key={record.id} className="glass-card" style={{ padding: 14, background: "var(--glass-light)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                  <p style={{ fontWeight: 600 }}>{record.title}</p>
                                  <StatusBadge status={record.record_type} />
                                </div>
                                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{record.description || "No description provided."}</p>
                                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{record.record_date} {record.file_name ? `- ${record.file_name}` : ""}</p>
                              </div>
                              {record.file_url && <button className="btn-secondary" onClick={() => window.open(resolveUrl(record.file_url), "_blank")}><FileText size={14} /> Open</button>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Patients
