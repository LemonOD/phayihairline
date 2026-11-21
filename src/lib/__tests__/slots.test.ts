import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/supabase/server", () => ({ createPublicClient: () => ({}) }))

import { buildSlots, isBookableStart, slotIso, SHOP_HOURS, type TakenRange } from "@/lib/data/slots"

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-20T06:00:00Z")) })
afterEach(() => vi.useRealTimers())

describe("slotIso", () => {
  it("converts Lagos time (WAT, UTC+1) to UTC", () => {
    expect(slotIso("2026-12-01", 9)).toBe("2026-12-01T08:00:00.000Z")
    expect(slotIso("2026-12-01", 0)).toBe("2026-11-30T23:00:00.000Z")
  })
})

describe("buildSlots", () => {
  const day = "2026-12-01"
  const range = (fromHour: number, toHour: number): TakenRange => ({ start: slotIso(day, fromHour), end: slotIso(day, toHour) })

  it("offers hourly slots across opening hours for a one-hour service", () => {
    const slots = buildSlots(day, 60, [])
    expect(slots).toHaveLength(SHOP_HOURS.close - SHOP_HOURS.open)
    expect(slots[0]?.hour).toBe(SHOP_HOURS.open)
    expect(slots.at(-1)?.hour).toBe(SHOP_HOURS.close - 1)
  })

  it("stops late starts that would run past closing", () => {
    const slots = buildSlots(day, 150, []) // 3 hours after rounding up
    expect(slots.at(-1)?.hour).toBe(SHOP_HOURS.close - 3)
  })

  it("rounds partial hours up", () => {
    expect(buildSlots(day, 90, []).at(-1)?.hour).toBe(SHOP_HOURS.close - 2)
  })

  it("marks taken slots unavailable", () => {
    const slots = buildSlots(day, 60, [range(10, 11)])
    expect(slots.find((s) => s.hour === 10)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 11)?.available).toBe(true)
  })

  it("marks slots in the past unavailable", () => {
    vi.setSystemTime(new Date("2026-12-01T10:30:00Z")) // 11:30 in Lagos
    const slots = buildSlots(day, 60, [])
    expect(slots.find((s) => s.hour === 11)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 12)?.available).toBe(true)
  })
})

describe("buildSlots with multi-hour bookings", () => {
  const day = "2026-12-01"
  const range = (fromHour: number, toHour: number): TakenRange => ({ start: slotIso(day, fromHour), end: slotIso(day, toHour) })
  const open = (slots: ReturnType<typeof buildSlots>) => slots.filter((s) => s.available).map((s) => s.hour)

  it("blocks every hour covered by an existing long booking", () => {
    // A 3-hour appointment 09:00-12:00 must block 09, 10 and 11 for a one-hour service
    expect(open(buildSlots(day, 60, [range(9, 12)])).slice(0, 2)).toEqual([12, 13])
  })

  it("blocks starts whose own duration would run into a later booking", () => {
    // Booked 12:00-13:00. A 2-hour service cannot start at 11:00 (ends 13:00) but can start at 10:00
    const slots = buildSlots(day, 120, [range(12, 13)])
    expect(slots.find((s) => s.hour === 10)?.available).toBe(true)
    expect(slots.find((s) => s.hour === 11)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 12)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 13)?.available).toBe(true)
  })

  it("treats back-to-back bookings as free (end is exclusive)", () => {
    expect(buildSlots(day, 60, [range(9, 10)]).find((s) => s.hour === 10)?.available).toBe(true)
  })
})

describe("isBookableStart (server-side guard)", () => {
  const day = "2026-12-01"
  it("accepts an on-the-hour start inside opening hours", () => {
    expect(isBookableStart(slotIso(day, 10), 60)).toBe(true)
  })
  it("rejects half-hour starts", () => {
    expect(isBookableStart("2026-12-01T09:30:00.000Z", 60)).toBe(false)
  })
  it("rejects starts before opening and at or after closing", () => {
    expect(isBookableStart(slotIso(day, SHOP_HOURS.open - 1), 60)).toBe(false)
    expect(isBookableStart(slotIso(day, SHOP_HOURS.close), 60)).toBe(false)
  })
  it("rejects a start whose service would finish after closing", () => {
    expect(isBookableStart(slotIso(day, SHOP_HOURS.close - 2), 150)).toBe(false) // 3h needed
    expect(isBookableStart(slotIso(day, SHOP_HOURS.close - 3), 150)).toBe(true)
  })
  it("rejects past times and garbage", () => {
    expect(isBookableStart(slotIso("2026-11-19", 10), 60)).toBe(false)
    expect(isBookableStart("not-a-date", 60)).toBe(false)
  })
})
