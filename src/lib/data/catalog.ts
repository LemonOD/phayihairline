import { createPublicClient } from "@/lib/supabase/server"
import { unwrap } from "./unwrap"
import type { Category, Product } from "@/types"

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating"

export type ProductQuery = {
  category?: string
  sort?: SortKey
  min?: number
  max?: number
  q?: string
  limit?: number
}

export async function getCategories(): Promise<Category[]> {
  return unwrap(await createPublicClient().from("categories").select("*").order("sort_order"), [] as Category[])
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  let req = createPublicClient().from("products").select("*").eq("is_active", true)

  if (query.category) req = req.eq("category", query.category)
  if (query.min !== undefined) req = req.gte("price", query.min)
  if (query.max !== undefined) req = req.lte("price", query.max)
  if (query.q) req = req.ilike("name", `%${query.q.replace(/[%,]/g, "")}%`)

  switch (query.sort) {
    case "price-asc": req = req.order("price", { ascending: true }); break
    case "price-desc": req = req.order("price", { ascending: false }); break
    case "rating": req = req.order("rating", { ascending: false }); break
    default: req = req.order("created_at", { ascending: false })
  }

  if (query.limit) req = req.limit(query.limit)
  return unwrap(await req, [] as Product[])
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return unwrap(
    await createPublicClient()
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("rating", { ascending: false })
      .limit(limit),
    [] as Product[],
  )
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return unwrap(
    await createPublicClient()
      .from("products")
      .select("*, variants:product_variants(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .order("sort_order", { referencedTable: "product_variants" })
      .maybeSingle(),
    null as Product | null,
  )
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return unwrap(
    await createPublicClient()
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(limit),
    [] as Product[],
  )
}

/** Lightweight list for sitemap and static generation. */
export async function getProductSlugs(): Promise<{ category: string; slug: string; updated_at: string }[]> {
  return unwrap(
    await createPublicClient().from("products").select("category, slug, updated_at").eq("is_active", true),
    [] as { category: string; slug: string; updated_at: string }[],
  )
}
