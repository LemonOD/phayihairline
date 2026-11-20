import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Calendar, Package } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Container } from "@/components/ui/section"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageTransition } from "@/components/ui/motion"
import { getMyBookings, getMyOrders } from "@/lib/data/account"
import { getSession } from "@/lib/data/session"
import { formatNaira } from "@/lib/utils"

export const metadata: Metadata = { title: "My account" }

const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })

export default async function AccountPage() {
  const { user, profile } = await getSession()
  if (!user) redirect("/login?next=/account")

  const [orders, bookings] = await Promise.all([getMyOrders(), getMyBookings()])

  return (
    <PageTransition>
      <Container className="max-w-4xl py-12">
        <h1 className="text-4xl font-semibold">Hello, {profile?.full_name?.split(" ")[0] ?? "there"}</h1>
        <p className="mt-1 text-muted-foreground">{user.email}</p>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold"><Package className="size-5 text-accent" /> Orders</h2>
          {orders.length === 0 ? <Card className="p-6 text-muted-foreground">No orders yet.</Card> : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <Card key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{o.reference}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.items.length} item(s) · {dateFmt.format(new Date(o.created_at))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3"><span className="font-semibold">{formatNaira(o.total)}</span><StatusBadge status={o.status} /></div>
                </Card>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold"><Calendar className="size-5 text-accent" /> Bookings</h2>
          {bookings.length === 0 ? <Card className="p-6 text-muted-foreground">No bookings yet.</Card> : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{b.service?.name}</p>
                    <p className="text-sm text-muted-foreground">{dateFmt.format(new Date(b.starts_at))}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </Card>
              ))}
            </ul>
          )}
        </section>
      </Container>
    </PageTransition>
  )
}
