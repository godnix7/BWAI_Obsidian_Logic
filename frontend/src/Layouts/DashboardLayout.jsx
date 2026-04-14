import { useState, useEffect } from "react"
import Sidebar from "@/components/Layout/Sidebar"
import MainLayout from "./MainLayout"
import { useAuthStore } from "@/store/authStore"
import { Menu } from "lucide-react"

const DashboardLayout = ({ children }) => {
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) setCollapsed(true)
      else setCollapsed(false)
      if (window.innerWidth > 768) setMobileOpen(false)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar 
        role={user?.role} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <div style={{ 
        flex: 1, 
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Mobile Header */}
        <div 
          className="show-mobile"
          style={{ 
            height: 60, 
            background: "var(--glass-medium)", 
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-default)",
            display: "none", // Controlled by CSS class show-mobile 
            alignItems: "center",
            padding: "0 20px",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 50
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button 
              onClick={() => setMobileOpen(true)}
              style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--eggplant)", margin: 0 }}>MediLocker</h2>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          overflow: "auto", 
          paddingBottom: 40 // Space for mobile nav if needed later
        }}>
          <MainLayout>{children}</MainLayout>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout