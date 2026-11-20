import Link from "next/link"
import { Calendar, Mail, Package, ShoppingBag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Stagger, StaggerItem } from "@/components/ui/motion"
import { getDashboardStats } from "@/lib/data/admin"

export default async function AdminOverview() {
  const s = await getDashboardStats()
  const cards = [
    { label: "Products", value: s.products, icon: ShoppingBag, href: "/admin/products" },
    { label: "Pending orders", value: s.pendingOrders, icon: Package, href: "/admin/orders" },
    { label: "Pending bookings", value: s.pendingBookings, icon: Calendar, href: "/admin/bookings" },
    { label: "Messages", value: s.messages, icon: Mail, href: "/admin/messages" },
  ]
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, href }) => (
        <StaggerItem key={label}>
          <Link href={href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <Icon className="mb-3 size-5 text-accent-text" />
              <p className="text-3xl font-semibold tabular-nums">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Card>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
