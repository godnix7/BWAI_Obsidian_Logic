import { useEffect } from "react"
import { pageEnter } from "@/utils/animations"

const MainLayout = ({ children }) => {
  useEffect(() => { pageEnter() }, [])

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020811 0%, #080F1E 40%, #0D1628 100%)",
      color: "var(--text-primary)"
    }}>
      <div className="animate-page" style={{ padding: 32, maxWidth: 1280 }}>
        {children}
      </div>
    </div>
  )
}

export default MainLayout