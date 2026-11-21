import { createClient } from "@/lib/supabase/server"
import { bankDetailsSchema, type BankDetails } from "@/lib/validation/schemas"

/**
 * The account customers pay into, or null when the owner hasn't set one (checkout then skips the
 * payment step). Never throws: a missing table or bad row must not break placing an order.
 */
export async function getBankDetails(): Promise<BankDetails | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("site_settings").select("value").eq("key", "bank_details").maybeSingle()
    const parsed = bankDetailsSchema.safeParse(data?.value)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
