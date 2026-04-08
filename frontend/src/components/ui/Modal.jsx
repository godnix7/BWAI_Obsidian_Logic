import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { modalOpen } from "@/utils/animations"

const Modal = ({ children, onClose, title, wide }) => {
  const panelRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    modalOpen(panelRef.current, backdropRef.current)
  }, [])

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel" ref={panelRef} style={wide ? { width: "min(720px, 95vw)" } : {}}>
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-lg font-bold font-display">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export default Modal
