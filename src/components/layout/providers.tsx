"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useAuthSync } from "@/hooks/use-auth-sync"
import { useHydrateStores } from "@/hooks/use-hydrate-stores"
import { LazyDrawers } from "./lazy-drawers"

export function Providers({ children }: { children: React.ReactNode }) {
  useHydrateStores()
  useAuthSync()
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        {children}
        <LazyDrawers />
        {/* Top of the screen: never covers the sticky buy bar or the cart's checkout button on phones. */}
        <Toaster position="top-center" richColors offset={12} toastOptions={{ duration: 2600 }} />
      </MotionConfig>
    </ThemeProvider>
  )
}
