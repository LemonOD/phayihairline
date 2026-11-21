import { ogImage, ogSize } from "@/lib/og"

export const alt = "PhayiHairline: luxury wigs, bundles, closures and frontals, shipped worldwide"
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "Worldwide · Wigs · Frontals · Tools",
    title: "Your hairline, flawlessly done.",
    subtitle: "Premium hair. Affordable luxury.",
  })
}
