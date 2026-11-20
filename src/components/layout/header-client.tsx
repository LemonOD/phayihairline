"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, Menu, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { navLinks } from "./nav-links"
import { useCart, cartCount } from "@/stores/cart"
import { useWishlist } from "@/stores/wishlist"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"

type Props = { logo: React.ReactNode; user: { name: string; isAdmin: boolean } | null }

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function HeaderClient({ logo, user }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const mounted = useMounted()
  const cart = useCart((s) => cartCount(s.lines))
  const wishes = useWishlist((s) => s.items.length)
  const setCartOpen = useCart((s) => s.setOpen)
  const setWishOpen = useWishlist((s) => s.setOpen)

  return (
    <Container className="flex h-16 items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <X /> : <Menu />}
        </Button>
        {logo}
      </div>

      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href}
              className={cn("relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", active && "text-foreground")}>
              {l.label}
              {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-accent" />}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist" onClick={() => setWishOpen(true)}>
          <Heart />
          <CountBadge count={mounted ? wishes : 0} />
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Cart" onClick={() => setCartOpen(true)}>
          <ShoppingBag />
          <CountBadge count={mounted ? cart : 0} />
        </Button>
        <UserMenu user={user} />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="absolute inset-x-0 top-16 overflow-hidden border-b bg-background md:hidden"
          >
            <ul className="space-y-1 p-4">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-base font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </Container>
  )
}
