import type React from "react"
import type {Metadata} from "next"
import {Inter} from "next/font/google"
import "./globals.css"

import {ThemeProvider} from "@/src/components/theme-provider"
import './globals.css'
import {ClientLayout} from "@/src/app/ClientLayout";

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
    title: "PhayiHairline - Premium Wigs, Frontals & Wigging Tools",
    description:
        "Shop high-quality wigs, frontals, and wigging tools. Professional wig installation services available in Adamo, Ikorodu, Lagos State.",
    icons: {
        icon: [
            {
                url: "/favicon.ico",
                sizes: "any",
            },
            {
                url: "/favicon.png",
                type: "image/png",
                sizes: "512x512",
            },
        ],
        apple: {
            url: "/apple-icon.png",
            type: "image/png",
            sizes: "180x180",
        },
    },

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ThemeProvider>
            <ClientLayout>{children}</ClientLayout> {/* Client-side wrapper */}
        </ThemeProvider>
        </body>
        </html>
    );
}

