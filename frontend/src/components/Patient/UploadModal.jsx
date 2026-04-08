import { useState } from "react"
import { uploadRecord } from "@/api/patient.api"

const UploadModal = ({ onClose, refresh }) => {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")

  const handleUpload = async () => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("record_type", "lab_report")

    await uploadRecord(formData)

    refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-xl w-[400px]">
        <h2 className="text-lg mb-4">Upload Record</h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full mb-3 p-2 bg-gray-800"
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpload} className="bg-blue-500 px-3 py-1">
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal