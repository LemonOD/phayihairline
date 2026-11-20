import type { PostgrestError } from "@supabase/supabase-js"
import { afterEach, describe, expect, it, vi } from "vitest"
import { toOrder, parseOrderItems } from "@/lib/orders"
import { unwrap } from "@/lib/data/unwrap"
import { isMissingFunction, missing } from "@/lib/actions/helpers"
import { bookingFormSchema, checkoutFormSchema } from "@/lib/validation/schemas"
import { orderMessage } from "@/lib/whatsapp"

const dbError: PostgrestError = { message: "boom", code: "X", details: "", hint: "", name: "PostgrestError", toJSON: () => ({ name: "PostgrestError", message: "boom", details: "", hint: "", code: "X" }) }
const line = { product_id: "p1", variant_id: null, name: "Wig", variant: '18"', price: 1500, quantity: 2, image: null }

describe("parseOrderItems (orders.items is untyped JSON in Postgres)", () => {
  it("accepts well-formed lines", () => {
    expect(parseOrderItems([line])).toEqual([line])
  })
  it("defaults a missing image to null", () => {
    expect(parseOrderItems([{ ...line, image: undefined }])[0]?.image).toBeNull()
  })
  it("returns [] for anything malformed instead of trusting it", () => {
    expect(parseOrderItems(null)).toEqual([])
    expect(parseOrderItems("nope")).toEqual([])
    expect(parseOrderItems([{ name: "x" }])).toEqual([])
  })
  it("toOrder keeps the row and validates its items", () => {
    const order = toOrder({
      id: "o1", reference: "PH-ABC123", user_id: null, customer_name: "Ada", customer_phone: "0801", delivery_address: "Lagos",
      items: [line], total: 3000, status: "pending", created_at: "",
    })
    expect(order.items).toHaveLength(1)
    expect(order.reference).toBe("PH-ABC123")
  })
})

describe("WhatsApp message built from server-charged lines", () => {
  it("uses the server price, not whatever was saved in the browser", () => {
    const msg = orderMessage({
      reference: "PH-1", name: "Ada", phone: "0801", address: "Lagos", total: 3000,
      items: [{ name: "Wig", price: 1500, quantity: 2, variantLabel: '18"' }],
    })
    expect(msg).toContain('2 × Wig (18")')
    expect(msg).toContain("Total: *₦3,000*")
  })
})

describe("unwrap", () => {
  const original = process.env.NEXT_PHASE
  afterEach(() => { process.env.NEXT_PHASE = original; vi.restoreAllMocks() })

  it("returns the data when the query succeeded", () => {
    expect(unwrap<number[]>({ data: [1, 2], error: null }, [])).toEqual([1, 2])
  })
  it("keeps a legitimately empty result empty", () => {
    expect(unwrap<number[]>({ data: [], error: null }, [9])).toEqual([])
  })
  it("returns null for a single-row query with no match", () => {
    expect(unwrap({ data: null, error: null } as { data: { id: string } | null; error: null }, null)).toBeNull()
  })
  it("throws when the query failed, so an outage is not cached as an empty shop", () => {
    expect(() => unwrap<unknown[]>({ data: null, error: dbError }, []))
      .toThrow(/Database query failed: boom/)
  })
  it("falls back during `next build`, so CI can build with a placeholder project", () => {
    process.env.NEXT_PHASE = "phase-production-build"
    expect(unwrap<string[]>({ data: null, error: dbError }, ["fallback"])).toEqual(["fallback"])
  })
})

describe("action helpers", () => {
  it("detects a missing database function (migration not applied yet)", () => {
    expect(isMissingFunction({ code: "PGRST202" })).toBe(true)
    expect(isMissingFunction({ code: "42883" })).toBe(true)
    expect(isMissingFunction({ code: "23505" })).toBe(false)
    expect(isMissingFunction(null)).toBe(false)
  })
  it("reports a write that matched nothing", () => {
    expect(missing("Product")).toEqual({ ok: false, error: "Product not found" })
  })
})

describe("form schemas derived from the server schemas", () => {
  it("checkout form uses the same phone rule as the server", () => {
    expect(checkoutFormSchema.safeParse({ name: "Ada", phone: "08155217967", address: "12 Marina Road" }).success).toBe(true)
    expect(checkoutFormSchema.safeParse({ name: "Ada", phone: "12345", address: "12 Marina Road" }).success).toBe(false)
  })
  it("booking form needs a chosen service but not a time (the page picks that separately)", () => {
    const base = { name: "Ada", phone: "08155217967" }
    expect(bookingFormSchema.safeParse({ ...base, serviceId: "" }).success).toBe(false)
    expect(bookingFormSchema.safeParse({ ...base, serviceId: "svc" }).success).toBe(true)
  })
})
