import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

export const formatNaira = (amount: number) => naira.format(amount)

export const discountPercent = (price: number, compareAt: number | null) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0

export const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export const siteConfig = {
  name: "PhayiHairline",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348155217967",
  phone: "08155217967",
  email: "info@phayihairline.com",
  address: "Adamo, Ikorodu, Lagos State, Nigeria",
  /** TODO(owner): confirm these before relying on them; they feed the contact page and Google structured data. */
  hours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "18:00", label: "Mon – Sat, 9:00am – 6:00pm" },
  /** Only rendered when set in env, so we never link to an account that doesn't exist. */
  socials: [
    { platform: "instagram" as const, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { platform: "tiktok" as const, url: process.env.NEXT_PUBLIC_TIKTOK_URL },
  ].filter((s): s is { platform: "instagram" | "tiktok"; url: string } => !!s.url),
}
