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
    <div className="record-card bg-white/10 backdrop-blur-xl p-4 rounded-xl">
      <h2 className="font-semibold">{record.title}</h2>
      <p className="text-sm opacity-70">{record.record_type}</p>

      <button
        onClick={handlePreview}
        className="mt-3 text-blue-400"
      >
        Preview
      </button>

      {preview && (
        <PreviewModal url={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}

export default RecordCard