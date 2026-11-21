"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/data/session"
import { createClient } from "@/lib/supabase/server"
import { bankDetailsSchema } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

export async function saveBankDetails(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = bankDetailsSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "bank_details", value: parsed.data, updated_at: new Date().toISOString() })
  if (error) {
    return fail(error.code === "42P01" || error.code === "PGRST205"
      ? "Run migration 0008_site_settings.sql in Supabase first."
      : error.message)
  }
  revalidatePath("/admin/payments")
  return { ok: true }
}

/** Removing the details switches the payment step off: customers go straight to WhatsApp. */
export async function clearBankDetails(): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("site_settings").delete().eq("key", "bank_details")
  if (error) return fail(error.message)
  revalidatePath("/admin/payments")
  return { ok: true }
}
