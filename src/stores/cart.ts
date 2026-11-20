import { create } from "zustand"
import { persist } from "zustand/middleware"
import { track } from "@/lib/analytics"
import type { Product, ProductVariant } from "@/types"

export const lineKey = (productId: string, variantId?: string | null) => `${productId}:${variantId ?? ""}`

export const variantLabel = (product: Product, variant: ProductVariant) =>
  product.option_names.map((n) => variant.options[n]).filter(Boolean).join(" / ")

export type CartLine = {
  /** Unique per product + variant. */
  key: string
  id: string
  variantId: string | null
  variantLabel: string | null
  slug: string
  name: string
  price: number
  image: string | null
  category: string
  stock: number
  quantity: number
}

type CartState = {
  lines: CartLine[]
  open: boolean
  add: (product: Product, quantity?: number, variant?: ProductVariant | null) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (p, quantity = 1, variant = null) =>
        set((s) => {
          const key = lineKey(p.id, variant?.id)
          track("add_to_cart", { product: p.name, value: variant?.price ?? p.price })
          const stock = variant ? variant.stock : p.stock
          const existing = s.lines.find((l) => l.key === key)
          if (existing) {
            const next = Math.min(existing.quantity + quantity, Math.max(stock, 1))
            return { lines: s.lines.map((l) => (l.key === key ? { ...l, quantity: next, stock } : l)), open: true }
          }
          const line: CartLine = {
            key, id: p.id, variantId: variant?.id ?? null, variantLabel: variant ? variantLabel(p, variant) : null,
            slug: p.slug, name: p.name, price: variant?.price ?? p.price, image: p.images[0] ?? null,
            category: p.category, stock, quantity: Math.min(quantity, Math.max(stock, 1)),
          }
          return { lines: [...s.lines, line], open: true }
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, Math.max(l.stock, 1)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "phayi-cart", version: 2, migrate: () => ({ lines: [] }), partialize: (s) => ({ lines: s.lines }), skipHydration: true },
  ),
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0)
