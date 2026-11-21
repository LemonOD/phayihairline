"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VariantPicker } from "./variant-picker"
import { WishlistButton } from "./wishlist-button"
import { useCart, variantLabel } from "@/stores/cart"
import { useIsDesktop } from "@/hooks/use-media-query"
import { discountPercent, formatNaira } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types"

const firstInStock = (variants: ProductVariant[]) => variants.find((v) => v.stock > 0) ?? variants[0]
const stepper = "flex size-11 items-center justify-center transition active:scale-90 hover:bg-muted disabled:pointer-events-none disabled:opacity-40"

/** Price, stock, options and add-to-cart, driven by the selected variant. */
export function ProductPurchase({ product }: { product: Product }) {
  const variants = product.variants ?? []
  const hasVariants = product.option_names.length > 0 && variants.length > 0
  const [selection, setSelection] = useState<Record<string, string>>(() => firstInStock(variants)?.options ?? {})
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(true)
  const add = useCart((s) => s.add)
  const isDesktop = useIsDesktop()
  const cta = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // The sticky bar only appears once the real button has scrolled out of view.
  useEffect(() => {
    const el = cta.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry?.isIntersecting ?? true))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])

  const variant = hasVariants
    ? variants.find((v) => product.option_names.every((n) => v.options[n] === selection[n])) ?? null
    : null

  const price = variant?.price ?? product.price
  const compareAt = variant ? variant.compare_at_price : product.compare_at_price
  const stock = hasVariants ? (variant?.stock ?? 0) : product.stock
  const discount = discountPercent(price, compareAt)
  const unavailable = hasVariants && !variant
  const soldOut = !unavailable && stock < 1
  const blocked = soldOut || unavailable
  const chosen = variant ? variantLabel(product, variant) : null

  function select(option: string, value: string) {
    const next = { ...selection, [option]: value }
    const exact = variants.some((v) => product.option_names.every((n) => v.options[n] === next[n]))
    // If the combination doesn't exist, move the other options to the closest valid one.
    const fallback = exact ? next : variants.find((v) => v.options[option] === value)?.options ?? next
    setSelection(fallback)
    setQty(1)
  }

  function addToCart() {
    add(product, qty, variant) // the cart opens by itself, so no toast is needed
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1800)
  }

  const label = soldOut ? "Sold out" : unavailable ? "Unavailable" : added ? "Added" : "Add to cart"
  const icon = added && !blocked ? <Check /> : <ShoppingBag />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
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

      <div ref={cta} className="flex items-center gap-3">
        <div className="flex items-center rounded-full border">
          <button type="button" className={`${stepper} rounded-l-full`} aria-label="Decrease quantity" disabled={qty <= 1}
            onClick={() => setQty((q) => q - 1)}><Minus className="size-4" /></button>
          <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">{qty}</span>
          <button type="button" className={`${stepper} rounded-r-full`} aria-label="Increase quantity" disabled={qty >= stock}
            onClick={() => setQty((q) => q + 1)}><Plus className="size-4" /></button>
        </div>
        <Button size="lg" className="flex-1" disabled={blocked} onClick={addToCart}>
          {icon} {label}
        </Button>
        <WishlistButton product={product} className="size-12 border" />
      </div>
      <p className="sr-only" role="status">{added ? `${qty} added to cart` : ""}</p>

      <AnimatePresence>
        {!isDesktop && !ctaVisible && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-background/95 px-4 pt-3 pb-safe-sm shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold leading-tight">{formatNaira(price)}</p>
              <p className="truncate text-xs text-muted-foreground">{chosen ?? product.name}</p>
            </div>
            <Button size="lg" className="min-w-40" disabled={blocked} onClick={addToCart}>
              {icon} {label}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
