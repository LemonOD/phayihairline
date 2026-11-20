"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useAuthSync } from "@/hooks/use-auth-sync"
import { useHydrateStores } from "@/hooks/use-hydrate-stores"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { WishlistDrawer } from "@/components/shop/wishlist-drawer"

export function Providers({ children }: { children: React.ReactNode }) {
  useHydrateStores()
  useAuthSync()
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        {children}
        <CartDrawer />
        <WishlistDrawer />
        <Toaster position="bottom-right" richColors closeButton />
      </MotionConfig>
    </ThemeProvider>
  )
}
