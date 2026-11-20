import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/utils"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/auth", "/update-password"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
