import { useEffect } from "react"
import { pageEnter } from "@/utils/animations"
import LiquidBackground from "@/components/ui/LiquidBackground"

const MainLayout = ({ children }) => {
  useEffect(() => { pageEnter() }, [])

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
      position: "relative"
    }}>
      <LiquidBackground />
      <div className="animate-page" style={{ 
        padding: "40px 32px", 
        maxWidth: 1400, 
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        pointerEvents: "auto",
      }}>
        {children}
      </div>
    </div>
  )
}

export default MainLayout
