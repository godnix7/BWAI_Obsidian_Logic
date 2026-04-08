import Sidebar from "@/components/Layout/Sidebar"
import MainLayout from "./MainLayout"
import { useAuthStore } from "@/store/authStore"

const DashboardLayout = ({ children }) => {
  const { user } = useAuthStore()

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar role={user?.role} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  )
}

export default DashboardLayout