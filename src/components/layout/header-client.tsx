"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, Menu, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/section"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"
import { navLinks } from "./nav-links"
import { useCart, cartCount } from "@/stores/cart"
import { useUI } from "@/stores/ui"
import { useWishlist } from "@/stores/wishlist"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"

type Props = { logo: React.ReactNode }

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count} aria-hidden
          initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

const itemsLabel = (n: number) => `${n} ${n === 1 ? "item" : "items"}`

/**
 * Phone: [menu] [logo] [cart · account], three equal columns so the logo is truly centred and nothing
 * overflows at 360px. Desktop: logo, inline nav, then all actions.
 */
export function HeaderClient({ logo }: Props) {
  const pathname = usePathname()
  const mounted = useMounted()
  const menuOpen = useUI((s) => s.menuOpen)
  const setMenuOpen = useUI((s) => s.setMenuOpen)
  const cart = useCart((s) => cartCount(s.lines))
  const wishes = useWishlist((s) => s.items.length)
  const setCartOpen = useCart((s) => s.setOpen)
  const setWishOpen = useWishlist((s) => s.setOpen)
  const cartN = mounted ? cart : 0
  const wishN = mounted ? wishes : 0

  return (
    <Container className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:h-16 lg:justify-between lg:gap-4">
      <div className="flex lg:hidden">
        <Button variant="ghost" size="icon" className="-ml-2" aria-label="Open menu" aria-haspopup="dialog"
          aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <Menu />
        </Button>
      </div>

      <div className="justify-self-center lg:justify-self-auto">{logo}</div>

      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {navLinks.map((l) => {
          const active = pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
              className={cn("relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", active && "text-foreground")}>
              {l.label}
              {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-accent" />}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-0.5 lg:gap-1">
        <div className="hidden lg:block"><ThemeToggle /></div>
        <Button variant="ghost" size="icon" className="relative hidden lg:inline-flex"
          aria-label={wishN ? `Wishlist, ${itemsLabel(wishN)}` : "Wishlist"} onClick={() => setWishOpen(true)}>
          <Heart />
          <CountBadge count={wishN} />
        </Button>
        <Button variant="ghost" size="icon" className="relative"
          aria-label={cartN ? `Cart, ${itemsLabel(cartN)}` : "Cart"} onClick={() => setCartOpen(true)}>
          <ShoppingBag />
          <CountBadge count={cartN} />
        </Button>
        <UserMenu />
      </div>
    </Container>
  )
}
