// app/dashboard/layout.tsx
import Sidebar from "@/components/layouts/sidebar-layout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted">{children}</main>
    </div>
  )
}
