import { useState, useEffect } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import Modal from "@/components/ui/Modal"
import EmptyState from "@/components/ui/EmptyState"
import { pageEnter, cardStagger } from "@/utils/animations"
import { mockBilling, mockPatients } from "@/data/mockData"
import { CreditCard, Plus, Trash2, Eye } from "lucide-react"

const Billing = () => {
  const [invoices] = useState(mockBilling)
  const [createOpen, setCreateOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState(null)
  const [tab, setTab] = useState("all")
  const [services, setServices] = useState([{ name: "", quantity: 1, unit_price: 0 }])

  useEffect(() => { pageEnter(); setTimeout(() => cardStagger(), 100) }, [])

  const filtered = tab === "all" ? invoices : invoices.filter(i => i.status === tab)
  const addService = () => setServices(s => [...s, { name: "", quantity: 1, unit_price: 0 }])

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

      {filtered.length === 0 ? <EmptyState icon={CreditCard} title="No invoices" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(inv => (
            <div key={inv.id} className="glass-card card" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{inv.invoice_number}</h3>
                  <StatusBadge status={inv.status} />
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>{inv.patient?.full_name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{inv.services.length} services · {inv.created_at?.split("T")[0]}</p>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>₹{inv.total_amount.toLocaleString()}</p>
                  {inv.payment_method && <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>{inv.payment_method}</p>}
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
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Patient: {viewInvoice.patient?.full_name}</p>
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
              {viewInvoice.services.map((s, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 0" }}>{s.name}</td>
                  <td style={{ textAlign: "center", padding: "10px 0" }}>{s.quantity}</td>
                  <td style={{ textAlign: "right", padding: "10px 0", fontFamily: "var(--font-mono)" }}>₹{s.unit_price.toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "10px 0", fontFamily: "var(--font-mono)", fontWeight: 600 }}>₹{(s.quantity * s.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, padding: 16, background: "var(--glass-light)", borderRadius: 10, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Subtotal</span><span style={{ fontFamily: "var(--font-mono)" }}>₹{viewInvoice.subtotal.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Tax</span><span style={{ fontFamily: "var(--font-mono)" }}>₹{viewInvoice.tax_amount.toLocaleString()}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>Discount</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--success)" }}>-₹{viewInvoice.discount_amount.toLocaleString()}</span></div>
            <div className="divider" style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>₹{viewInvoice.total_amount.toLocaleString()}</span></div>
          </div>
        </Modal>
      )}

      {createOpen && (
        <Modal title="Create Invoice" onClose={() => setCreateOpen(false)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Patient</label>
                <select className="input">{mockPatients.map(p => <option key={p.id}>{p.full_name}</option>)}</select></div>
              <div><label className="input-label">Payment Method</label>
                <select className="input"><option>cash</option><option>card</option><option>insurance</option><option>upi</option></select></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="input-label" style={{ margin: 0 }}>Services</p>
              <button className="btn-ghost" onClick={addService} style={{ fontSize: 13 }}><Plus size={14} /> Add</button>
            </div>
            {services.map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
                <div><label className="input-label">Service</label><input className="input" placeholder="Service name" /></div>
                <div><label className="input-label">Qty</label><input className="input" type="number" defaultValue={1} /></div>
                <div><label className="input-label">Price (₹)</label><input className="input" type="number" placeholder="0" /></div>
                {services.length > 1 && <button className="btn-ghost" style={{ padding: 8, color: "var(--error)", marginBottom: 2 }} onClick={() => setServices(s => s.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label className="input-label">Tax %</label><input className="input" type="number" defaultValue={5} /></div>
              <div><label className="input-label">Discount (₹)</label><input className="input" type="number" defaultValue={0} /></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setCreateOpen(false)}>Generate Invoice</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Billing
