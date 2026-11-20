import { createPublicClient } from "@/lib/supabase/server"

/** Shop hours (Lagos, WAT = UTC+1, no DST). Last slot must end by closing. */
export const SHOP_HOURS = { open: 9, close: 18 }
const WAT_OFFSET = "+01:00"

export const slotIso = (date: string, hour: number) =>
  new Date(`${date}T${String(hour).padStart(2, "0")}:00:00${WAT_OFFSET}`).toISOString()

export function buildSlots(date: string, durationMinutes: number, taken: Set<string>) {
  const hours = Math.ceil(durationMinutes / 60)
  const now = Date.now()
  const slots: { hour: number; iso: string; available: boolean }[] = []

  for (let hour = SHOP_HOURS.open; hour + hours <= SHOP_HOURS.close; hour++) {
    const iso = slotIso(date, hour)
    slots.push({ hour, iso, available: !taken.has(iso) && new Date(iso).getTime() > now })
  }
  return slots
}

export async function getTakenSlots(date: string): Promise<Set<string>> {
  const { data } = await createPublicClient().rpc("taken_slots", {
    p_from: slotIso(date, 0),
    p_to: slotIso(date, 23),
  })
  return new Set(((data as string[]) ?? []).map((d) => new Date(d).toISOString()))
}
