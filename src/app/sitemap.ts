import type { MetadataRoute } from "next"
import { getCategories, getProductSlugs } from "@/lib/data/catalog"
import { siteConfig } from "@/lib/utils"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProductSlugs()])
  const url = (path: string) => `${siteConfig.url}${path}`

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/book"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.6 },
    ...categories.map((c) => ({ url: url(`/products/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({
      url: url(`/products/${p.category}/${p.slug}`),
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
