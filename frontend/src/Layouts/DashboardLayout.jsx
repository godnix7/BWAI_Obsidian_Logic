import { useState, useEffect } from "react"
import Sidebar from "@/components/Layout/Sidebar"
import MainLayout from "./MainLayout"
import { useAuthStore } from "@/store/authStore"

const DashboardLayout = ({ children }) => {
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100) setCollapsed(true)
      else setCollapsed(false)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar role={user?.role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ 
        flex: 1, 
        overflow: "auto", 
        transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  )
}

export default DashboardLayout