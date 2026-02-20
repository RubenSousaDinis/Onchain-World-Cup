import type { Metadata } from "next"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminNav } from "@/components/admin/admin-nav"

export const metadata: Metadata = {
  title: "Admin Dashboard — Onchain World Cup",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Onchain World Cup management console</p>
      <AdminGuard>
        <AdminNav />
        {children}
      </AdminGuard>
    </div>
  )
}
