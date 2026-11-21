import { beforeEach, describe, expect, it, vi } from "vitest"

const track = vi.fn()
vi.mock("@/lib/analytics", () => ({ track: (...args: unknown[]) => track(...args) }))

import { cartCount, cartTotal, useCart } from "@/stores/cart"
import type { ProductSummary, ProductVariant } from "@/types"

const product = (over: Partial<ProductSummary> = {}): ProductSummary => ({
  id: "p1", slug: "wig", name: "Wig", price: 1000, category: "wigs", stock: 5, images: ["/a.jpg"], option_names: [], ...over,
})
const variant: ProductVariant = {
  id: "v1", product_id: "p1", options: { Length: '18"' }, price: 1500, compare_at_price: null, stock: 2, sort_order: 1, created_at: "",
}

beforeEach(() => {
  track.mockClear()
  useCart.setState({ lines: [], open: false })
})

describe("cart add", () => {
  it("tracks exactly once per add, however many times the state updater runs", () => {
    useCart.getState().add(product())
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith("add_to_cart", { product: "Wig", value: 1000 })
  })

  it("merges repeat adds and opens the drawer", () => {
    useCart.getState().add(product())
    useCart.getState().add(product(), 2)
    const { lines, open } = useCart.getState()
    expect(lines).toHaveLength(1)
    expect(lines[0]?.quantity).toBe(3)
    expect(open).toBe(true)
  })

  it("never lets quantity exceed stock", () => {
    useCart.getState().add(product({ stock: 2 }), 10)
    expect(useCart.getState().lines[0]?.quantity).toBe(2)
    useCart.getState().add(product({ stock: 2 }), 1)
    expect(useCart.getState().lines[0]?.quantity).toBe(2)
  })

  it("keeps variants as separate lines priced from the variant", () => {
    useCart.getState().add(product({ option_names: ["Length"] }), 1, variant)
    useCart.getState().add(product({ option_names: ["Length"] }))
    const { lines } = useCart.getState()
    expect(lines).toHaveLength(2)
    expect(lines.find((l) => l.variantId === "v1")).toMatchObject({ price: 1500, variantLabel: '18"' })
    expect(track).toHaveBeenNthCalledWith(1, "add_to_cart", { product: "Wig", value: 1500 })
  })
})

describe("cart quantities and totals", () => {
  it("removes a line when its quantity drops to zero", () => {
    useCart.getState().add(product())
    const key = useCart.getState().lines[0]!.key
    useCart.getState().setQuantity(key, 0)
    expect(useCart.getState().lines).toHaveLength(0)
  })

  it("sums count and total across lines", () => {
    useCart.getState().add(product(), 2)
    useCart.getState().add(product({ id: "p2", name: "Closure", price: 500 }), 3)
    const { lines } = useCart.getState()
    expect(cartCount(lines)).toBe(5)
    expect(cartTotal(lines)).toBe(2 * 1000 + 3 * 500)
  })
})
