"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { ConfirmProvider } from "@/components/ui/confirm"
import { useAuthSync } from "@/hooks/use-auth-sync"
import { useHydrateStores } from "@/hooks/use-hydrate-stores"

export function Providers({ children }: { children: React.ReactNode }) {
  useHydrateStores()
  useAuthSync()
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <ConfirmProvider>{children}</ConfirmProvider>
        {/* Top right: never covers the sticky buy bar or the cart's checkout button on phones. */}
        <Toaster position="top-right" richColors offset={12} toastOptions={{ duration: 2600 }} />
      </MotionConfig>
    </ThemeProvider>
  )
}
