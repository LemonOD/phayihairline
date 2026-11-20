"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { emailBookingStatus, notifyNewBooking } from "@/lib/notify"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/data/session"
import { bookingSchema } from "@/lib/validation/schemas"
import { isBookableStart } from "@/lib/data/slots"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

const whenFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" })

export async function createBooking(input: unknown): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { serviceId, startsAt, name, phone, email, notes } = parsed.data
  const supabase = await createClient()
  const { data: svc } = await supabase
    .from("services").select("name, duration_minutes").eq("id", serviceId).eq("is_active", true).maybeSingle()
  if (!svc) return fail("That service is no longer available")

  const start = new Date(startsAt)
  if (!isBookableStart(startsAt, svc.duration_minutes)) return fail("Please choose a time within opening hours")

  const { user } = await getSession()
  const { error } = await supabase.from("bookings").insert({
    service_id: serviceId,
    user_id: user?.id ?? null,
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    starts_at: startsAt,
    notes: notes || null,
  })

  // 23P01: overlaps another active booking (migration 0005). 23505: identical start time.
  if (error?.code === "23P01" || error?.code === "23505") return fail("That time was just taken. Please pick another.")
  if (error) return fail("We couldn't complete your booking. Please try again.")

  const service = svc.name as string
  const when = whenFmt.format(start)
  after(async () => {
    await notifyNewBooking({ service, when, name, phone })
    if (email) await emailBookingStatus({ email, name, service, when, status: "pending" })
  })

  revalidatePath("/account")
  return { ok: true }
}
