import { describe, expect, it } from "vitest"
import {
  bookingSchema, checkoutSchema, contactSchema, passwordSchema, productSchema, registerSchema, reviewSchema, serviceSchema,
} from "@/lib/validation/schemas"

const uuid = "123e4567-e89b-42d3-a456-426614174000"

describe("Nigerian phone validation", () => {
  const base = { name: "Ada", address: "12 Adamo Road, Ikorodu", items: [{ product_id: uuid, quantity: 1 }] }
  it.each(["08155217967", "07012345678", "09012345678", "+2348155217967", "2348155217967"])("accepts %s", (phone) => {
    expect(checkoutSchema.safeParse({ ...base, phone }).success).toBe(true)
  })
  it.each(["12345", "0815521796", "06012345678", "+4412345678901", "abc"])("rejects %s", (phone) => {
    expect(checkoutSchema.safeParse({ ...base, phone }).success).toBe(false)
  })
})

describe("checkoutSchema", () => {
  const ok = { name: "Ada Obi", phone: "08155217967", address: "12 Adamo Road", items: [{ product_id: uuid, quantity: 2 }] }
  it("accepts a valid order, with or without a variant", () => {
    expect(checkoutSchema.safeParse(ok).success).toBe(true)
    expect(checkoutSchema.safeParse({ ...ok, items: [{ product_id: uuid, variant_id: uuid, quantity: 1 }] }).success).toBe(true)
  })
  it("rejects empty carts and silly quantities", () => {
    expect(checkoutSchema.safeParse({ ...ok, items: [] }).success).toBe(false)
    expect(checkoutSchema.safeParse({ ...ok, items: [{ product_id: uuid, quantity: 0 }] }).success).toBe(false)
    expect(checkoutSchema.safeParse({ ...ok, items: [{ product_id: uuid, quantity: 21 }] }).success).toBe(false)
  })
  it("rejects non-uuid product ids", () => {
    expect(checkoutSchema.safeParse({ ...ok, items: [{ product_id: "1; drop table", quantity: 1 }] }).success).toBe(false)
  })
})

describe("bookingSchema", () => {
  const ok = { serviceId: uuid, startsAt: "2026-12-01T09:00:00.000Z", name: "Ada", phone: "08155217967" }
  it("accepts a minimal booking and an empty optional email", () => {
    expect(bookingSchema.safeParse(ok).success).toBe(true)
    expect(bookingSchema.safeParse({ ...ok, email: "" }).success).toBe(true)
  })
  it("rejects bad dates and bad emails", () => {
    expect(bookingSchema.safeParse({ ...ok, startsAt: "tomorrow" }).success).toBe(false)
    expect(bookingSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false)
  })
})

describe("auth schemas", () => {
  it("requires 8+ character passwords", () => {
    const base = { fullName: "Ada Obi", email: "ada@example.com" }
    expect(registerSchema.safeParse({ ...base, password: "short" }).success).toBe(false)
    expect(registerSchema.safeParse({ ...base, password: "longenough" }).success).toBe(true)
  })
  it("requires matching confirmation", () => {
    expect(passwordSchema.safeParse({ password: "longenough", confirm: "different" }).success).toBe(false)
    expect(passwordSchema.safeParse({ password: "longenough", confirm: "longenough" }).success).toBe(true)
  })
})

describe("contactSchema & reviewSchema", () => {
  it("needs a real message", () => {
    expect(contactSchema.safeParse({ name: "Ada", email: "a@b.co", message: "hi" }).success).toBe(false)
    expect(contactSchema.safeParse({ name: "Ada", email: "a@b.co", message: "Do you ship to Abuja?" }).success).toBe(true)
  })
  it("bounds ratings to 1-5", () => {
    const base = { productId: uuid, body: "Lovely quality wig, great finish." }
    expect(reviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false)
    expect(reviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false)
    expect(reviewSchema.safeParse({ ...base, rating: 5 }).success).toBe(true)
  })
})

describe("productSchema variants", () => {
  const base = { name: "Wig", price: 1000, category: "wigs", stock: 1, option_names: ["Length"] }
  const v = (length: string) => ({ options: { Length: length }, price: 1000, stock: 2 })

  it("accepts complete, unique variants", () => {
    expect(productSchema.safeParse({ ...base, variants: [v('14"'), v('18"')] }).success).toBe(true)
  })
  it("rejects duplicate combinations", () => {
    const r = productSchema.safeParse({ ...base, variants: [v('14"'), v('14"')] })
    expect(r.success).toBe(false)
  })
  it("rejects variants missing an option value", () => {
    expect(productSchema.safeParse({ ...base, option_names: ["Length", "Density"], variants: [v('14"')] }).success).toBe(false)
  })
  it("rejects variants when no option names are given", () => {
    expect(productSchema.safeParse({ ...base, option_names: [], variants: [v('14"')] }).success).toBe(false)
  })
  it("coerces numeric strings from form inputs", () => {
    const r = productSchema.parse({ ...base, price: "2500", stock: "3", variants: [] })
    expect(r.price).toBe(2500)
  })
})

describe("productSchema images", () => {
  const base = { name: "Wig", price: 1000, category: "wigs", stock: 1 }
  const ok = (images: string[]) => productSchema.safeParse({ ...base, images }).success

  it("accepts Supabase Storage URLs and bundled site-relative photos", () => {
    expect(ok(["https://abc.supabase.co/storage/v1/object/public/product-images/a.jpg", "/brand/product-curly-revamp.jpg"])).toBe(true)
  })
  it.each(["javascript:alert(1)", "//evil.example/x.jpg", "http://insecure.example/x.jpg", "x.jpg"])("rejects %s", (img) => {
    expect(ok([img])).toBe(false)
  })
})

describe("serviceSchema price", () => {
  const base = { name: "Custom install", duration_minutes: "120" }

  it("keeps a fixed price, coercing the form string", () => {
    expect(serviceSchema.parse({ ...base, price: "15000" }).price).toBe(15000)
  })

  it("accepts no price (null or blank) as 'based on request'", () => {
    expect(serviceSchema.parse({ ...base, price: null }).price).toBeNull()
    expect(serviceSchema.parse({ ...base, price: "" }).price).toBeNull()
  })

  it("still rejects a negative price", () => {
    expect(serviceSchema.safeParse({ ...base, price: "-5" }).success).toBe(false)
  })
})
