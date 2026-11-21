import Link from "next/link"
import { ArrowRight, Calendar, Mail, Package, Plus, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAdminOrders, getDashboardStats, getUpcomingBookings } from "@/lib/data/admin"
import { getSession } from "@/lib/data/session"
import { formatNaira } from "@/lib/utils"
import type { BookingStatus, OrderStatus } from "@/types"

const when = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" })
const ago = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", timeZone: "Africa/Lagos" })

const tone: Record<OrderStatus | BookingStatus, "warning" | "success" | "accent" | "danger" | "muted"> = {
  pending: "warning", confirmed: "success", shipped: "accent", delivered: "success", completed: "success", cancelled: "danger",
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          View all <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {children}
    </Card>
  )
}

export default async function AdminOverview() {
  const [stats, orders, upcoming, { profile }] = await Promise.all([getDashboardStats(), getAdminOrders(), getUpcomingBookings(5), getSession()])

  const recentOrders = orders.slice(0, 5)

  const first = profile?.full_name?.trim().split(" ")[0]
  const cards = [
    { label: "Products", value: stats.products, icon: ShoppingBag, href: "/admin/products" },
    { label: "Pending orders", value: stats.pendingOrders, icon: Package, href: "/admin/orders" },
    { label: "Pending bookings", value: stats.pendingBookings, icon: Calendar, href: "/admin/bookings" },
    { label: "Messages", value: stats.messages, icon: Mail, href: "/admin/messages" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{first ? `Welcome back, ${first}` : "Overview"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here is what needs your attention today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm"><Link href="/admin/products/new"><Plus /> Add product</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href="/admin/services/new"><Plus /> Add service</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="block">
            <Card className="h-full p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <Icon className="mb-3 size-5 text-accent-text" aria-hidden />
              <p className="text-3xl font-semibold tabular-nums">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 sm:gap-6">
        <Panel title="Recent orders" href="/admin/orders">
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet. New ones appear here.</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href="/admin/orders" className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{o.customer_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.reference} · {ago.format(new Date(o.created_at))}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatNaira(o.total)}</span>
                    <Badge variant={tone[o.status]} className="capitalize">{o.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming bookings" href="/admin/bookings">
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing booked ahead. New appointments appear here.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href="/admin/bookings" className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.service?.name ?? "Appointment"}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.customer_name} · {when.format(new Date(b.starts_at))}</p>
                    </div>
                    <Badge variant={tone[b.status]} className="capitalize">{b.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
