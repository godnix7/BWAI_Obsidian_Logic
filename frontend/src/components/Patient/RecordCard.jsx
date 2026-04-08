import { useState } from "react"
import PreviewModal from "./PreviewModal"
import { getRecordUrl } from "@/api/patient.api"

const RecordCard = ({ record }) => {
  const [preview, setPreview] = useState(null)

  const handlePreview = async () => {
    const res = await getRecordUrl(record.id)
    setPreview(res.data.url)
  }

  return (
    <div className="glass-card card" style={{ height: "100%", width: "100%" }}>
      <div className="card-inner" style={{ paddingLeft: 32 }}>
        {/* Type Badge Stripe */}
        <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 5, background: "var(--accent)", borderRadius: "0 4px 4px 0" }} />
        
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="badge badge-accent" style={{ fontSize: 10, padding: "4px 12px" }}>{record.record_type}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>ID: #{record.id.slice(0,8)}</span>
          </div>
          <h2 className="text-xl font-bold font-display" style={{ color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{record.title}</h2>
        </div>

        <div className="mt-auto pt-6 flex justify-between items-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{new Date().toLocaleDateString()}</span>
          <button
            onClick={handlePreview}
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            View Record
          </button>
        </div>
      </div>

      {preview && (
        <PreviewModal url={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}

export default RecordCard