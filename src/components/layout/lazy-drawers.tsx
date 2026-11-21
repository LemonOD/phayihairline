"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useCart } from "@/stores/cart"
import { useUI } from "@/stores/ui"
import { useWishlist } from "@/stores/wishlist"

const loadCart = () => import("@/components/shop/cart-drawer").then((m) => m.CartDrawer)
const loadWishlist = () => import("@/components/shop/wishlist-drawer").then((m) => m.WishlistDrawer)

const loadNav = () => import("./mobile-nav").then((m) => m.MobileNav)

const CartDrawer = dynamic(loadCart, { ssr: false })
const MobileNav = dynamic(loadNav, { ssr: false })
const WishlistDrawer = dynamic(loadWishlist, { ssr: false })

/**
 * The drawers (Radix Dialog + Framer Motion) are closed on first paint, so they stay out of the
 * initial bundle: fetched once the browser is idle, mounted the first time they are opened.
 */
export function LazyDrawers() {
  const cartOpen = useCart((s) => s.open)
  const wishOpen = useWishlist((s) => s.open)
  const menuOpen = useUI((s) => s.menuOpen)
  const [cartSeen, setCartSeen] = useState(false)
  const [wishSeen, setWishSeen] = useState(false)
  const [menuSeen, setMenuSeen] = useState(false)

  // Latch "has been opened" so a drawer keeps its exit animation and state after closing.
  if (cartOpen && !cartSeen) setCartSeen(true)
  if (wishOpen && !wishSeen) setWishSeen(true)
  if (menuOpen && !menuSeen) setMenuSeen(true)

  useEffect(() => {
    // Warm the chunks so the first open doesn't wait on the network.
    const warm = () => { void loadCart(); void loadWishlist(); void loadNav() }
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(warm, 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {cartSeen && <CartDrawer />}
      {wishSeen && <WishlistDrawer />}
      {menuSeen && <MobileNav />}
    </>
  )
}
