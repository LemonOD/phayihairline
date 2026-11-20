import { ogImage, ogSize } from "@/lib/og"

export const alt = "PhayiHairline: luxury wigs, bundles, closures and frontals in Lagos"
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "Lagos · Wigs · Frontals · Tools",
    title: "Your hairline, flawlessly done.",
    subtitle: "Premium hair. Affordable luxury.",
  })
}
