"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Boxes, CalendarDays, Landmark, LayoutDashboard, MessageSquare, Scissors, ShoppingBag, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, count: "orders" },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, count: "bookings" },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/payments", label: "Payments", icon: Landmark },
] as const

export type AdminCounts = { orders: number; bookings: number }

/** The admin area's main navigation: a vertical list in the sidebar (desktop) and in the menu drawer (phone/tablet). */
export function AdminNav({ counts, onNavigate }: { counts: AdminCounts; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin">
      <ul className="space-y-0.5">
        {items.map((t) => {
          const active = "exact" in t && t.exact ? pathname === t.href : pathname.startsWith(t.href)
          const pending = "count" in t ? counts[t.count] : 0
          return (
            <li key={t.href}>
              <Link href={t.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <t.icon className="size-[18px] shrink-0" aria-hidden />
                <span className="flex-1">{t.label}</span>
                {pending > 0 && (
                  <span className={cn("min-w-5 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground")}>
                    <span aria-hidden>{pending}</span>
                    <span className="sr-only">{pending} pending</span>
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
