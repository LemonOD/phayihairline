"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/messages", label: "Messages" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin" className="mb-8 flex gap-1 overflow-x-auto border-b">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href)
        return (
          <Link key={t.href} href={t.href}
            className={cn("-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
