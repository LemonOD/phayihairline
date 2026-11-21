"use server"

import { after } from "next/server"
import { emailOrderReceived, notifyNewOrder } from "@/lib/notify"
import { parseOrderItems } from "@/lib/orders"
import { getBankDetails } from "@/lib/data/settings"
import { getSession } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { checkoutSchema, type BankDetails } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult, OrderItem } from "@/types"

/** `items` are the lines exactly as priced and charged by Postgres; `null` until migration 0006 is applied. */
export type PlacedOrder = { reference: string; total: number; items: OrderItem[] | null; bank: BankDetails | null; emailedTo: string | null }

/** Totals are recomputed in Postgres (place_order), so the client cannot tamper with prices. */
export async function placeOrder(input: unknown): Promise<ActionResult<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { name, phone, address, items, email } = parsed.data
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
  const charged = row.items == null ? null : parseOrderItems(row.items)
  // The shop account is read now (not at build time) so an admin edit applies to the very next order.
  const bank = await getBankDetails()

  // The address they typed wins; otherwise a signed-in customer's account email. Guests who left it blank get no email.
  const { user } = await getSession()
  const to = email || user?.email || null
  const emailedTo = to && process.env.RESEND_API_KEY ? to : null
  if (emailedTo) {
    after(() => emailOrderReceived({
      to: emailedTo, name, reference: row.reference, total: row.total, address, bank,
      items: (charged ?? []).map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, variantLabel: i.variant ?? null })),
    }))
  }
  return { ok: true, data: { reference: row.reference, total: row.total, items: charged?.length ? charged : null, bank, emailedTo } }
}
