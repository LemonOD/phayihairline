import { createClient, createPublicClient } from "@/lib/supabase/server"
import { unwrap } from "@/lib/data/unwrap"
import type { Review } from "@/types"

export async function getReviews(productId: string): Promise<Review[]> {
  return unwrap(
    await createPublicClient()
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(30),
    [],
  )
}

export function summarize(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0]
  for (const r of reviews) counts[r.rating - 1] = (counts[r.rating - 1] ?? 0) + 1
  return counts
}

export async function getAdminReviews() {
  const supabase = await createClient()
  return unwrap(
    await supabase
      .from("reviews")
      .select("*, product:products(name)")
      .order("created_at", { ascending: false })
      .limit(100),
    [],
  )
}
