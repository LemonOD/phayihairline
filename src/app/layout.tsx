import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { siteConfig } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Luxury Wigs, Bundles & Frontals in Lagos · PhayiHairline", template: "%s · PhayiHairline" },
  alternates: { canonical: "./" },
  description:
    "Shop luxury wigs, bundles, closures and frontals in Lagos. Premium hair, affordable luxury, with custom units and revamping.",
  openGraph: { siteName: siteConfig.name, type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <a href="#main"
          className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="min-h-[70vh] outline-none">{children}</main>
          <SiteFooter />
        </Providers>
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
