import { ogImage, ogSize } from "@/lib/og"

export const alt = "PhayiHairline: premium wigs, frontals and wig installation in Ikorodu, Lagos"
export const size = ogSize
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "Lagos · Wigs · Frontals · Tools",
    title: "Your hairline, flawlessly done.",
    subtitle: "Premium wigs and expert installation in Ikorodu",
  })
}
