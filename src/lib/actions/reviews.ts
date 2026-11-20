"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/data/session"
import { notifyNewReview } from "@/lib/notify"
import { reviewSchema } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

export async function submitReview(input: unknown): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { productId, rating, title, body } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase.rpc("submit_review", {
    p_product_id: productId, p_rating: rating, p_title: title ?? "", p_body: body,
  })
  // Business-rule errors raised by the function use errcode P0001 and are safe to show.
  if (error?.code === "P0001") return fail(error.message)
  if (error) return fail("We couldn't save your review. Please try again.")

  const { data: product } = await supabase.from("products").select("name, category, slug").eq("id", productId).maybeSingle()
  if (product) {
    after(() => notifyNewReview({ product: product.name, rating, body }))
    revalidatePath(`/products/${product.category}/${product.slug}`)
  }
  return { ok: true }
}

type ProductRef = { category: string; slug: string }

/** Refresh the pages that show this product's reviews and rating. PostgREST embeds arrive as an object or a one-item array. */
function refreshReviewed({ product }: { product: ProductRef | ProductRef[] | null }) {
  revalidatePath("/admin/reviews")
  revalidatePath("/")
  const ref = Array.isArray(product) ? product[0] : product
  if (ref) revalidatePath(`/products/${ref.category}/${ref.slug}`)
}

export async function setReviewStatus(id: string, status: "published" | "hidden"): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reviews").update({ status }).eq("id", id).select("product:products(category, slug)").maybeSingle()
  if (error) return fail(error.message)
  if (!data) return fail("Review not found")
  refreshReviewed(data)
  return { ok: true }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reviews").delete().eq("id", id).select("product:products(category, slug)").maybeSingle()
  if (error) return fail(error.message)
  if (!data) return fail("Review not found")
  refreshReviewed(data)
  return { ok: true }
}
