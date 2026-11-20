"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useHydrateStores } from "@/hooks/use-hydrate-stores"
import { CartDrawer } from "@/components/shop/cart-drawer"
import { WishlistDrawer } from "@/components/shop/wishlist-drawer"

export function Providers({ children }: { children: React.ReactNode }) {
  useHydrateStores()
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
      <CartDrawer />
      <WishlistDrawer />
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  )
}
