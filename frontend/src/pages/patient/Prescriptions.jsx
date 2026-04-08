import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { Pill, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import { getPrescriptions } from "@/api/Patient.api"

const Prescriptions = () => {
  const [expanded, setExpanded] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const listRef = useRef(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await getPrescriptions()
      setPrescriptions(res.data)
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData()
    pageEnter(); 
    setTimeout(() => {
      cardStagger()
      if (listRef.current) scrollReveal(listRef.current)
    }, 500) 
  }, [])

  if (loading) return (
      <DashboardLayout>
           <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Prescriptions" description="View prescriptions from your doctors" />

      {prescriptions.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions" description="Your prescriptions will appear here once issued by a doctor." />
      ) : (
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="glass-card card" style={{ width: "100%" }}>
              <div className="card-inner">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                  onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                  <div style={{ paddingLeft: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <h3 className="text-xl font-bold font-display" style={{ color: "var(--accent)" }}>{rx.diagnosis}</h3>
                      <StatusBadge status={new Date(rx.valid_until) >= new Date() ? "active" : "expired"} />
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, fontFamily: "var(--font-mono)", marginTop: 10, fontWeight: 500 }}>
                      <span style={{ color: "var(--text-muted)" }}>📅 Prescribed:</span> {rx.created_at?.split("T")[0]} 
                      {rx.valid_until && <span style={{ marginLeft: 16 }}><span style={{ color: "var(--text-muted)" }}>⏳ Valid:</span> {rx.valid_until}</span>}
                    </p>
                  </div>
                  <div style={{ paddingLeft: 24 }}>
                    {expanded === rx.id ? <ChevronUp size={24} color="var(--text-muted)" /> : <ChevronDown size={24} color="var(--text-muted)" />}
                  </div>
                </div>

                {expanded === rx.id && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: "2px solid var(--border-subtle)" }}>
                    {rx.notes && <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, fontStyle: "italic", lineHeight: 1.5 }}>📝 {rx.notes}</p>}
                    <p className="input-label" style={{ marginBottom: 14 }}>Medications</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                      {rx.medications?.map(med => (
                        <div key={med.id} style={{
                          padding: 18, borderRadius: 16, background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-subtle)"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{med.medication_name}</span>
                            <span className="badge badge-accent" style={{ padding: "4px 12px" }}>{med.dosage}</span>
                          </div>
                          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                            <span>⏰ {med.frequency}</span>
                            <span>📆 {med.duration}</span>
                          </div>
                          {med.instructions && (
                            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.4 }}>💊 {med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Prescriptions
