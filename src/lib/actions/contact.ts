"use server"

import { after } from "next/server"
import { notifyNewMessage } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { contactSchema } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

export async function sendContactMessage(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { name, email, phone, message } = parsed.data
  const supabase = await createClient()
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone: phone || null, message })

  if (error) return fail("We couldn't send your message. Please try again.")
  after(() => notifyNewMessage({ name, email, message }))
  return { ok: true }
}
