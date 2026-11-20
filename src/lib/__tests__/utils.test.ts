import { describe, expect, it } from "vitest"
import { discountPercent, formatNaira, slugify } from "@/lib/utils"

describe("formatNaira", () => {
  it("formats whole naira with the ₦ symbol and thousands separators", () => {
    expect(formatNaira(45000).replace(/\s/g, "")).toBe("₦45,000")
  })
})

describe("discountPercent", () => {
  it("rounds the saving against the compare-at price", () => {
    expect(discountPercent(45000, 55000)).toBe(18)
  })
  it("is 0 without a higher compare-at price", () => {
    expect(discountPercent(45000, null)).toBe(0)
    expect(discountPercent(45000, 45000)).toBe(0)
    expect(discountPercent(45000, 40000)).toBe(0)
  })
})

describe("slugify", () => {
  it("lowercases, collapses punctuation and trims dashes", () => {
    expect(slugify("  Brazilian Body-Wave Wig! ")).toBe("brazilian-body-wave-wig")
    expect(slugify('18" Straight (HD)')).toBe("18-straight-hd")
  })
})
