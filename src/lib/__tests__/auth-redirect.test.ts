import { describe, expect, it } from "vitest"
import { explicitNext, homeFor } from "@/lib/auth-redirect"

describe("homeFor", () => {
  it("sends admins to the dashboard and everyone else to their account", () => {
    expect(homeFor("admin")).toBe("/admin")
    expect(homeFor("customer")).toBe("/account")
    expect(homeFor(null)).toBe("/account")
    expect(homeFor(undefined)).toBe("/account")
  })
})

describe("explicitNext", () => {
  it("keeps a same-site path the visitor was sent from", () => {
    expect(explicitNext("/checkout")).toBe("/checkout")
    expect(explicitNext("/admin/orders")).toBe("/admin/orders")
  })
  it("ignores a missing value so the role-based home applies", () => {
    expect(explicitNext(null)).toBeNull()
    expect(explicitNext(undefined)).toBeNull()
    expect(explicitNext("")).toBeNull()
  })
  it("never allows an open redirect to another site", () => {
    expect(explicitNext("//evil.example")).toBeNull()
    expect(explicitNext("https://evil.example")).toBeNull()
    expect(explicitNext("javascript:alert(1)")).toBeNull()
  })
})
