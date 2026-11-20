"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { emailBookingStatus, notifyNewBooking } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/data/session"
import { bookingSchema } from "@/lib/validation/schemas"
import { SHOP_HOURS } from "@/lib/data/slots"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

const whenFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" })

export async function createBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { serviceId, startsAt, name, phone, email, notes } = parsed.data
  const start = new Date(startsAt)
  const watHour = (start.getUTCHours() + 1) % 24
  if (start.getTime() < Date.now() || watHour < SHOP_HOURS.open || watHour >= SHOP_HOURS.close) {
    return fail("Please choose a time within opening hours")
  }

  const { user } = await getSession()
  const supabase = await createClient()
  const { error } = await supabase.from("bookings").insert({
    service_id: serviceId,
    user_id: user?.id ?? null,
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    starts_at: startsAt,
    notes: notes || null,
  })

  if (error?.code === "23505") return fail("That slot was just taken. Please pick another time.")
  if (error) return fail("We couldn't complete your booking. Please try again.")

  const { data: svc } = await supabase.from("services").select("name").eq("id", serviceId).maybeSingle()
  const service = (svc?.name as string | undefined) ?? "appointment"
  const when = whenFmt.format(start)
  after(async () => {
    await notifyNewBooking({ service, when, name, phone })
    if (email) await emailBookingStatus({ email, name, service, when, status: "pending" })
  })

  revalidatePath("/account")
  return { ok: true }
}
