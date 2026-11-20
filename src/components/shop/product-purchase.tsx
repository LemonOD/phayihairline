"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VariantPicker } from "./variant-picker"
import { WishlistButton } from "./product-card"
import { useCart } from "@/stores/cart"
import { discountPercent, formatNaira } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types"

const firstInStock = (variants: ProductVariant[]) => variants.find((v) => v.stock > 0) ?? variants[0]

/** Price, stock, options and add-to-cart, driven by the selected variant. */
export function ProductPurchase({ product }: { product: Product }) {
  const variants = product.variants ?? []
  const hasVariants = product.option_names.length > 0 && variants.length > 0
  const [selection, setSelection] = useState<Record<string, string>>(() => firstInStock(variants)?.options ?? {})
  const [qty, setQty] = useState(1)
  const add = useCart((s) => s.add)

  const variant = hasVariants
    ? variants.find((v) => product.option_names.every((n) => v.options[n] === selection[n])) ?? null
    : null

  const price = variant?.price ?? product.price
  const compareAt = variant ? variant.compare_at_price : product.compare_at_price
  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock
  const discount = discountPercent(price, compareAt)
  const unavailable = hasVariants && !variant
  const soldOut = !unavailable && stock < 1

  function select(option: string, value: string) {
    const next = { ...selection, [option]: value }
    const exact = variants.some((v) => product.option_names.every((n) => v.options[n] === next[n]))
    // If the combination doesn't exist, move the other options to the closest valid one.
    const fallback = exact ? next : variants.find((v) => v.options[option] === value)?.options ?? next
    setSelection(fallback)
    setQty(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="text-3xl font-semibold">
            {formatNaira(price)}
          </motion.span>
        </AnimatePresence>
        {compareAt && <span className="text-muted-foreground line-through">{formatNaira(compareAt)}</span>}
        {discount > 0 && <Badge variant="accent">Save {discount}%</Badge>}
      </div>

      {hasVariants && <VariantPicker product={product} selection={selection} onSelect={select} />}

      <div>
        {unavailable ? <Badge variant="muted">This combination isn&apos;t available</Badge>
          : soldOut ? <Badge variant="danger">Sold out</Badge>
          : <Badge variant={stock <= 5 ? "warning" : "success"}>{stock <= 5 ? `Only ${stock} left` : "In stock"}</Badge>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button variant="ghost" size="icon" aria-label="Decrease quantity" disabled={qty <= 1}
            onClick={() => setQty((q) => q - 1)}><Minus /></Button>
          <span className="w-10 text-center tabular-nums" aria-live="polite">{qty}</span>
          <Button variant="ghost" size="icon" aria-label="Increase quantity" disabled={qty >= stock}
            onClick={() => setQty((q) => q + 1)}><Plus /></Button>
        </div>
        <Button size="lg" className="flex-1" disabled={soldOut || unavailable}
          onClick={() => { add(product, qty, variant); toast.success(`${qty} × ${product.name} added`) }}>
          <ShoppingBag /> {soldOut ? "Sold out" : "Add to cart"}
        </Button>
        <WishlistButton product={product} className="border" />
      </div>
    </div>
  )
}
