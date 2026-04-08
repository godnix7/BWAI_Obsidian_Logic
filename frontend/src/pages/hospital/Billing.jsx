import { useState, useEffect, useRef } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger, scrollReveal } from "@/utils/animations"
import { CreditCard, Plus, Trash2, Eye, Loader2, IndianRupee } from "lucide-react"
import { getInvoices, createInvoice, updateInvoice, getHospitalPatients } from "@/api/Hospital.api"

const Billing = () => {
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState(null)
  const [tab, setTab] = useState("all")
  
  // Create Invoice State
  const [formData, setFormData] = useState({
      patient_id: "",
      tax_percent: 5,
      discount_amount: 0
  })
  const [services, setServices] = useState([{ name: "", quantity: 1, unit_price: 0 }])

  const listRef = useRef(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invoiceRes, patientRes] = await Promise.all([
        getInvoices(),
        getHospitalPatients()
      ])
      setInvoices(invoiceRes.data)
      setPatients(patientRes.data)
    } catch (err) {
      console.error("Failed to fetch billing:", err)
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

  const filtered = tab === "all" ? invoices : invoices.filter(i => i.status === tab)
  
  const addService = () => setServices(s => [...s, { name: "", quantity: 1, unit_price: 0 }])
  const removeService = (i) => setServices(s => s.filter((_, idx) => idx !== i))
  const updateService = (idx, key, val) => {
      const newS = [...services]
      newS[idx][key] = val
      setServices(newS)
  }

  const handleCreate = async () => {
      if (!formData.patient_id || services.some(s => !s.name || s.unit_price <= 0)) {
          return alert("Please fill patient ID and service details correctly")
      }

      const subtotal = services.reduce((acc, s) => acc + (s.quantity * s.unit_price), 0)
      const taxAmount = (subtotal * (formData.tax_percent / 100))
      const total = subtotal + taxAmount - formData.discount_amount

      try {
          setSubmitting(true)
          const payload = {
              patient_id: formData.patient_id,
              services: services,
              subtotal: subtotal,
              tax_amount: taxAmount,
              discount_amount: formData.discount_amount,
              total_amount: total
          }
          await createInvoice(payload)
          fetchData()
          setCreateOpen(false)
          setServices([{ name: "", quantity: 1, unit_price: 0 }])
          setFormData({ patient_id: "", tax_percent: 5, discount_amount: 0 })
      } catch (err) {
          alert("Failed to create invoice.")
      } finally {
          setSubmitting(false)
      }
  }

  const handleStatusUpdate = async (invoiceId, status) => {
      try {
          await updateInvoice(invoiceId, { status })
          await fetchData()
          setViewInvoice(prev => prev?.id === invoiceId ? { ...prev, status } : prev)
      } catch (err) {
          alert("Failed to update invoice.")
      }
  }

  if (loading) return (
      <DashboardLayout>
           <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}><Loader2 className="animate-spin" size={32} /></div>
      </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <PageHeader title="Billing" description="Manage invoices and payments">
        <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Invoice</button>
      </PageHeader>

      <div className="tab-bar" style={{ marginBottom: 24, width: "fit-content" }}>
        {["all", "unpaid", "paid", "partial"].map(t => (
          <button key={t} className={`tab-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon={CreditCard} title="No invoices found" description="Generated invoices will appear here." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(inv => (
            <div key={inv.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{inv.invoice_number}</h3>
                  <StatusBadge status={inv.status} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    Patient ID: <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{inv.patient_id}</span>
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{inv.services?.length} services · {inv.created_at?.split("T")[0]}</p>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>₹{Number(inv.total_amount).toLocaleString()}</p>
                  {inv.payment_method && <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>{inv.payment_method}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {inv.status !== "paid" && <button className="btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => handleStatusUpdate(inv.id, "paid")}>Mark Paid</button>}
                  {inv.status === "unpaid" && <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => handleStatusUpdate(inv.id, "partial")}>Mark Partial</button>}
                </div>
                <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setViewInvoice(inv)}><Eye size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewInvoice && (
        <Modal title={`Invoice ${viewInvoice.invoice_number}`} onClose={() => setViewInvoice(null)} wide>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Patient ID: {viewInvoice.patient_id}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Date: {viewInvoice.created_at?.split("T")[0]}</p>
          </div>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              <th style={{ textAlign: "left", padding: "8px 0", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600 }}>Service</th>
              <th style={{ textAlign: "center", padding: "8px 0", color: "var(--text-secondary)", fontSize: 12 }}>Qty</th>
              <th style={{ textAlign: "right", padding: "8px 0", color: "var(--text-secondary)", fontSize: 12 }}>Price</th>
              <th style={{ textAlign: "right", padding: "8px 0", color: "var(--text-secondary)", fontSize: 12 }}>Total</th>
            </tr></thead>
            <tbody>
              {viewInvoice.services?.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 0" }}>{s.name}</td>
                  <td style={{ textAlign: "center", padding: "10px 0" }}>{s.quantity}</td>
                  <td style={{ textAlign: "right", padding: "10px 0", fontFamily: "var(--font-mono)" }}>₹{Number(s.unit_price).toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "10px 0", fontFamily: "var(--font-mono)", fontWeight: 600 }}>₹{(s.quantity * s.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, padding: 16, background: "var(--glass-light)", borderRadius: 10, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Subtotal</span><span style={{ fontFamily: "var(--font-mono)" }}>₹{Number(viewInvoice.subtotal).toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Tax</span><span style={{ fontFamily: "var(--font-mono)" }}>₹{Number(viewInvoice.tax_amount).toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Discount</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--success)" }}>-₹{Number(viewInvoice.discount_amount).toLocaleString()}</span></div>
            <div className="divider" style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>Total Paid/Due</span><span style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>₹{Number(viewInvoice.total_amount).toLocaleString()}</span></div>
          </div>
        </Modal>
      )}

      {createOpen && (
        <Modal title="Create Invoice" onClose={() => setCreateOpen(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                  <label className="input-label">Patient</label>
                  <select className="input" value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})}>
                      <option value="">Select a patient...</option>
                      {patients.length === 0 && <option disabled>No consented patients found</option>}
                      {patients.map(p => (
                          <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className="input-label">Initial Status</label>
                  <select className="input" disabled><option>unpaid</option></select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="input-label" style={{ margin: 0 }}>Services / Line Items</p>
              <button className="btn-ghost" onClick={addService} style={{ fontSize: 13 }}><Plus size={14} /> Add Item</button>
            </div>
            
            <div style={{ maxHeight: 250, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                {services.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                    <div><label className="input-label">Service</label><input className="input" placeholder="e.g. MRI Scan" value={s.name} onChange={e => updateService(i, "name", e.target.value)} /></div>
                    <div><label className="input-label">Qty</label><input className="input" type="number" value={s.quantity} onChange={e => updateService(i, "quantity", parseInt(e.target.value))} /></div>
                    <div><label className="input-label">Price (₹)</label><input className="input" type="number" placeholder="0" value={s.unit_price} onChange={e => updateService(i, "unit_price", parseFloat(e.target.value))} /></div>
                    {services.length > 1 && <button className="btn-ghost" style={{ padding: 8, color: "var(--error)", marginBottom: 2 }} onClick={() => removeService(i)}><Trash2 size={14} /></button>}
                </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Tax %</label><input className="input" type="number" value={formData.tax_percent} onChange={e => setFormData({...formData, tax_percent: parseFloat(e.target.value)})} /></div>
              <div><label className="input-label">Discount (₹)</label><input className="input" type="number" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: parseFloat(e.target.value)})} /></div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <button className="btn-ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />} 
                  Generate Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Billing
