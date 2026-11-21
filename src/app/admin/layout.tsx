import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getDashboardStats } from "@/lib/data/admin"
import { getSession } from "@/lib/data/session"

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } }

/** The back office: its own sidebar / top bar, deliberately without the storefront frame. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSession()
  if (!user) redirect("/login?next=/admin")
  if (profile?.role !== "admin") redirect("/")

  const stats = await getDashboardStats()
  return (
    <AdminShell name={profile.full_name?.trim() || user.email || "Admin"} email={user.email ?? ""}
      counts={{ orders: stats.pendingOrders, bookings: stats.pendingBookings }}>
      {children}
    </AdminShell>
  )
}
