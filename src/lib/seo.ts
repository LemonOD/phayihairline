import { siteConfig } from "@/lib/utils"

const intlPhone = `+${siteConfig.whatsapp}`

/** schema.org HairSalon: what Google uses for local-pack results like "wig installation Ikorodu". */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "Store"],
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: intlPhone,
    email: siteConfig.email,
    priceRange: "₦₦",
    description:
      "Premium human hair wigs, lace frontals and wigging tools, with wig installation in Ikorodu, Lagos, and worldwide shipping.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ikorodu",
      addressRegion: "Lagos State",
      addressCountry: "NG",
    },
    areaServed: ["Ikorodu", "Lagos"],
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: siteConfig.hours.days,
      opens: siteConfig.hours.opens,
      closes: siteConfig.hours.closes,
    }],
    ...(siteConfig.socials.length ? { sameAs: siteConfig.socials.map((s) => s.url) } : {}),
  }
}

export const jsonLdScript = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, "\\u003c"),
})
