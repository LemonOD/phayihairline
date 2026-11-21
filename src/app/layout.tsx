import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"
import { siteConfig } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "PhayiHairline - Luxury Wigs, Bundles & Frontals Worldwide", template: "%s · PhayiHairline" },
  alternates: { canonical: "./" },
  description:
    "Shop luxury wigs, bundles, closures and frontals, shipped worldwide. Premium hair, affordable luxury, with custom units and revamping.",
  openGraph: { siteName: siteConfig.name, type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets us paint under the notch and respect safe-area insets
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" data-scroll-behavior="smooth" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main"
          className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        {/* Header and footer live in the (site) group layout; sign-in and admin have their own frames. */}
        <Providers>{children}</Providers>
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
