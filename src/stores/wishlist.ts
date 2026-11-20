import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, ProductSummary } from "@/types"

export type WishItem = Pick<Product, "id" | "slug" | "name" | "price" | "category" | "stock"> & {
  image: string | null
}

type WishState = {
  items: WishItem[]
  open: boolean
  toggle: (product: ProductSummary) => boolean
  remove: (id: string) => void
  setOpen: (open: boolean) => void
}

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      toggle: (p) => {
        const exists = get().items.some((i) => i.id === p.id)
        set((s) => ({
          items: exists
            ? s.items.filter((i) => i.id !== p.id)
            : [...s.items, { id: p.id, slug: p.slug, name: p.name, price: p.price, category: p.category, stock: p.stock, image: p.images[0] ?? null }],
        }))
        return !exists
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setOpen: (open) => set({ open }),
    }),
    { name: "phayi-wishlist", partialize: (s) => ({ items: s.items }), skipHydration: true },
  ),
)
