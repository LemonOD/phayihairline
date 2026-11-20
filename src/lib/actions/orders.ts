"use server"

import { after } from "next/server"
import { notifyNewOrder } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { checkoutSchema } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

export type PlacedOrder = { reference: string; total: number }

/** Totals are recomputed in Postgres (place_order), so the client cannot tamper with prices. */
export async function placeOrder(input: unknown): Promise<ActionResult<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { name, phone, address, items } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("place_order", {
    p_name: name,
    p_phone: phone,
    p_address: address,
    p_items: items,
  })

  const row = Array.isArray(data) ? data[0] : null
  if (error?.message.startsWith("Not enough stock")) return fail(`${error.message}. Please reduce the quantity.`)
  if (error?.message.startsWith("That option") || error?.message.startsWith("Please choose")) return fail(error.message)
  if (error || !row) return fail("We couldn't place your order. Please try again.")
  after(() => notifyNewOrder({ reference: row.reference, name, phone, total: row.total }))
  return { ok: true, data: { reference: row.reference, total: row.total } }
}
