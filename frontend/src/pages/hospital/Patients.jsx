import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { Users, ChevronDown, ChevronUp, FileText, Loader2, Hospital } from "lucide-react"
import { getReceivedConsents, getHospitalPatientRecords } from "@/api/Hospital.api"

const API_BASE = "http://127.0.0.1:8002"
const resolveUrl = (url) => url?.startsWith("http") ? url : `${API_BASE}${url}`

const Patients = () => {
  const [expanded, setExpanded] = useState(null)
  const [consents, setConsents] = useState([])
  const [recordsByPatient, setRecordsByPatient] = useState({})
  const [loadingRecordsFor, setLoadingRecordsFor] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getReceivedConsents()
      setConsents(res.data)
    } catch (err) {
      console.error("Failed to fetch hospital patients:", err)
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
    const isOpen = expanded === consent.id
    setExpanded(isOpen ? null : consent.id)

    if (isOpen || recordsByPatient[consent.patient?.id] || !consent.patient?.id) {
      return
    }

    try {
      setLoadingRecordsFor(consent.patient.id)
      const res = await getHospitalPatientRecords(consent.patient.id)
      setRecordsByPatient((current) => ({
        ...current,
        [consent.patient.id]: res.data,
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
      <PageHeader title="Hospital Patients" description="Managed patients with active data access granted to this facility" />

      {consents.length === 0 ? <EmptyState icon={Users} title="No active patient records" description="Patient records will appear here as they grant permission to this hospital for diagnostic uploads." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {consents.map(consent => {
            const patient = consent.patient
            if (!patient) return null
            const isOpen = expanded === consent.id
            const records = recordsByPatient[patient.id] || []

            return (
              <div key={consent.id} className="glass-card card" style={{ width: "100%" }}>
                <div className="card-inner">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                    onClick={() => handleToggle(consent)}>
                    <div style={{ flex: 1, display: "flex", gap: 20, alignItems: "start" }}>
                      <div style={{ padding: 12, borderRadius: 12, background: "var(--bg-accent)", color: "var(--accent)" }}>
                          <Users size={24} />
                      </div>
                      <div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <h3 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)" }}>{patient.full_name}</h3>
                          <StatusBadge status={consent.access_level} />
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>UIID: <span style={{ fontFamily: "var(--font-mono)" }}>{patient.id}</span></p>
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                          <div className="glass-card" style={{ padding: 16, background: "var(--glass-light)", textAlign: "center" }}>
                              <FileText size={20} style={{ margin: "0 auto 10px", color: "var(--accent)" }} />
                              <p style={{ fontSize: 13, fontWeight: 600 }}>Upload Lab Report</p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Add diagnostics to patient record</p>
                          </div>
                          <div className="glass-card" style={{ padding: 16, background: "var(--glass-light)", textAlign: "center" }}>
                              <Hospital size={20} style={{ margin: "0 auto 10px", color: "var(--warning)" }} />
                              <p style={{ fontSize: 13, fontWeight: 600 }}>Manage Billing</p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Generate invoice for this patient</p>
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
