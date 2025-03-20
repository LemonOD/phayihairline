import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/src/components/theme-provider"
import { CartProvider } from "@/src/lib/context/cart-context"
import { WishlistProvider } from "@/src/lib/context/wishlist-context"
import { FilterProvider } from "@/src/lib/context/filter-context"
import { Toaster } from "@/src/components/ui/toaster"
import SiteHeader from "@/src/components/site-header"
import SiteFooter from "@/src/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PhayiHairline - Premium Wigs, Frontals & Wigging Tools",
  description:
    "Shop high-quality wigs, frontals, and wigging tools. Professional wig installation services available in Adamo, Ikorodu, Lagos State.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            <WishlistProvider>
              <FilterProvider>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                  <Toaster />
                </div>
              </FilterProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
