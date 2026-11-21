import { beforeEach, describe, expect, it } from "vitest"
import { orderMessage, whatsappLink } from "@/lib/whatsapp"
import { cartCount, cartTotal, lineKey, useCart } from "@/stores/cart"
import type { Product, ProductVariant } from "@/types"

const product: Product = {
  id: "p1", slug: "wig", name: "Wig", description: "", price: 10000, compare_at_price: null, category: "wigs",
  images: [], features: [], tags: [], stock: 5, rating: 0, review_count: 0, is_featured: false, is_active: true,
  option_names: ["Length"], created_at: "", updated_at: "",
}
const v = (id: string, len: string, price: number, stock = 5): ProductVariant =>
  ({ id, product_id: "p1", options: { Length: len }, price, compare_at_price: null, stock, sort_order: 0, created_at: "" })

beforeEach(() => useCart.setState({ lines: [], open: false }))

describe("whatsapp", () => {
  it("url-encodes the message", () => {
    expect(whatsappLink("Hi & bye\nline")).toContain("text=Hi%20%26%20bye%0Aline")
  })
  it("lists lines with their variant and the total", () => {
    const msg = orderMessage({
      reference: "PH-ABC123", name: "Ada", phone: "0815", address: "Ikorodu", total: 20000,
      items: [{ name: "Wig", variantLabel: '18"', price: 10000, quantity: 2 }],
    })
    expect(msg).toContain("PH-ABC123")
    expect(msg).toMatch(/2 × Wig \(18"\)/)
    expect(msg).toContain("Ikorodu")
  })
})

describe("cart store", () => {
  it("keeps separate lines per variant and merges identical ones", () => {
    const { add } = useCart.getState()
    add(product, 1, v("a", '14"', 8000))
    add(product, 1, v("b", '18"', 10000))
    add(product, 2, v("a", '14"', 8000))
    const { lines } = useCart.getState()
    expect(lines).toHaveLength(2)
    expect(lines.find((l) => l.key === lineKey("p1", "a"))?.quantity).toBe(3)
    expect(cartCount(lines)).toBe(4)
    expect(cartTotal(lines)).toBe(3 * 8000 + 10000)
  })
  it("uses the variant's price and caps quantity at its stock", () => {
    useCart.getState().add(product, 99, v("a", '14"', 8000, 3))
    const [line] = useCart.getState().lines
    expect(line?.price).toBe(8000)
    expect(line?.quantity).toBe(3)
    expect(line?.variantLabel).toBe('14"')
  })
  it("removes a line when quantity drops to zero", () => {
    useCart.getState().add({ ...product, option_names: [] })
    useCart.getState().setQuantity(lineKey("p1"), 0)
    expect(useCart.getState().lines).toHaveLength(0)
  })
})
