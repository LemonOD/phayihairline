import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/data/session"
import type { Review } from "@/types"

const BUYER_STATUSES = ["confirmed", "shipped", "delivered"]

export async function getReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(30)
  return (data as Review[]) ?? []
}

export type Eligibility = "ok" | "login" | "not-purchased" | "reviewed"

/** UX hint only: submit_review() re-checks everything inside Postgres. */
export async function getEligibility(productId: string): Promise<Eligibility> {
  const { user } = await getSession()
  if (!user) return "login"

  const supabase = await createClient()
  const [mine, orders] = await Promise.all([
    supabase.from("reviews").select("id").eq("product_id", productId).eq("user_id", user.id).maybeSingle(),
    supabase.from("orders").select("id").in("status", BUYER_STATUSES)
      .contains("items", [{ product_id: productId }]).limit(1),
  ])
  if (mine.data) return "reviewed"
  return orders.data?.length ? "ok" : "not-purchased"
}

export function summarize(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0]
  for (const r of reviews) counts[r.rating - 1] = (counts[r.rating - 1] ?? 0) + 1
  return counts
}

export async function getAdminReviews() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reviews")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false })
    .limit(100)
  return (data as (Review & { product: { name: string } | null })[]) ?? []
}
