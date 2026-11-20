import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/supabase/server", () => ({ createPublicClient: () => ({}) }))

import { buildSlots, slotIso, SHOP_HOURS } from "@/lib/data/slots"

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

  it("offers hourly slots across opening hours for a one-hour service", () => {
    const slots = buildSlots(day, 60, new Set())
    expect(slots).toHaveLength(SHOP_HOURS.close - SHOP_HOURS.open)
    expect(slots[0]?.hour).toBe(SHOP_HOURS.open)
    expect(slots.at(-1)?.hour).toBe(SHOP_HOURS.close - 1)
  })

  it("stops late starts that would run past closing", () => {
    const slots = buildSlots(day, 150, new Set()) // 3 hours after rounding up
    expect(slots.at(-1)?.hour).toBe(SHOP_HOURS.close - 3)
  })

  it("rounds partial hours up", () => {
    expect(buildSlots(day, 90, new Set()).at(-1)?.hour).toBe(SHOP_HOURS.close - 2)
  })

  it("marks taken slots unavailable", () => {
    const taken = new Set([slotIso(day, 10)])
    const slots = buildSlots(day, 60, taken)
    expect(slots.find((s) => s.hour === 10)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 11)?.available).toBe(true)
  })

  it("marks slots in the past unavailable", () => {
    vi.setSystemTime(new Date("2026-12-01T10:30:00Z")) // 11:30 in Lagos
    const slots = buildSlots(day, 60, new Set())
    expect(slots.find((s) => s.hour === 11)?.available).toBe(false)
    expect(slots.find((s) => s.hour === 12)?.available).toBe(true)
  })
})
