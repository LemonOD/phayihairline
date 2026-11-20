"use server"

import { createPublicClient } from "@/lib/supabase/server"
import type { Product } from "@/types"

/** Fresh price/stock for a product (used when moving wishlist items into the cart). */
export async function getProductForCart(id: string): Promise<Product | null> {
  const { data } = await createPublicClient().from("products").select("*").eq("id", id).eq("is_active", true).maybeSingle()
  return (data as Product | null) ?? null
}
