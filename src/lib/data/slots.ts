import { createPublicClient } from "@/lib/supabase/server"

/** Shop hours (Lagos, WAT = UTC+1, no DST). Last slot must end by closing. */
export const SHOP_HOURS = { open: 9, close: 18 }
const WAT_OFFSET = "+01:00"
const HOUR_MS = 3_600_000

export type TakenRange = { start: string; end: string }

export const slotIso = (date: string, hour: number) =>
  new Date(`${date}T${String(hour).padStart(2, "0")}:00:00${WAT_OFFSET}`).toISOString()

/** A service blocks whole hours; keep in sync with `booking_end()` in migration 0005. */
export const hoursNeeded = (durationMinutes: number) => Math.ceil(durationMinutes / 60)

const overlaps = (aStart: number, aEnd: number, taken: TakenRange[]) =>
  taken.some((t) => aStart < new Date(t.end).getTime() && aEnd > new Date(t.start).getTime())

export function buildSlots(date: string, durationMinutes: number, taken: TakenRange[]) {
  const hours = hoursNeeded(durationMinutes)
  const now = Date.now()
  const slots: { hour: number; iso: string; available: boolean }[] = []

  for (let hour = SHOP_HOURS.open; hour + hours <= SHOP_HOURS.close; hour++) {
    const iso = slotIso(date, hour)
    const start = new Date(iso).getTime()
    slots.push({ hour, iso, available: start > now && !overlaps(start, start + hours * HOUR_MS, taken) })
  }
  return slots
}

/**
 * Server-side check that a requested start is a real, bookable slot: on the hour, in the future,
 * and finishing before closing. Never trust the slot list the browser was shown.
 */
export function isBookableStart(startsAtIso: string, durationMinutes: number, now = Date.now()) {
  const start = new Date(startsAtIso)
  if (Number.isNaN(start.getTime()) || start.getTime() <= now) return false
  const wat = new Date(start.getTime() + HOUR_MS) // shift so the UTC getters read Lagos wall time
  if (wat.getUTCMinutes() !== 0 || wat.getUTCSeconds() !== 0 || wat.getUTCMilliseconds() !== 0) return false
  const hour = wat.getUTCHours()
  return hour >= SHOP_HOURS.open && hour + hoursNeeded(durationMinutes) <= SHOP_HOURS.close
}

export async function getTakenSlots(date: string): Promise<TakenRange[]> {
  // Overlap query: any active booking touching this Lagos day, including ones that started earlier.
  const { data, error } = await createPublicClient().rpc("taken_slots", {
    p_from: slotIso(date, 0),
    p_to: slotIso(date, 23),
  })
  if (error) throw new Error(`Could not load booked slots: ${error.message}`, { cause: error })
  return (data ?? []).map((r) => ({ start: r.starts_at, end: r.ends_at }))
}
