import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin/admin-nav"
import { Container } from "@/components/ui/section"
import { getSession } from "@/lib/data/session"

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSession()
  if (!user) redirect("/login?next=/admin")
  if (profile?.role !== "admin") redirect("/")

  return (
    <Container className="py-8">
      <AdminNav />
      {children}
    </Container>
  )
}
