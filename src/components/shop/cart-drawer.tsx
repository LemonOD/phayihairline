"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { useCart, cartCount, cartTotal } from "@/stores/cart"
import { useIsDesktop } from "@/hooks/use-media-query"
import { formatNaira } from "@/lib/utils"

const stepper = "flex size-11 items-center justify-center rounded-full border transition active:scale-90 hover:bg-muted disabled:pointer-events-none disabled:opacity-40 md:size-9"

export function CartDrawer() {
  const lines = useCart((s) => s.lines)
  const open = useCart((s) => s.open)
  const setOpen = useCart((s) => s.setOpen)
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const isDesktop = useIsDesktop()
  const count = cartCount(lines)
  const total = cartTotal(lines)

  return (
    <Sheet open={open} onOpenChange={setOpen} side={isDesktop ? "right" : "bottom"} title="Your cart"
      description={`${count} ${count === 1 ? "item" : "items"}`}>
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent-text"><ShoppingBag className="size-7" /></span>
          <div>
            <p className="font-serif text-xl">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Find your next unit and it will wait for you here.</p>
          </div>
          <Button asChild size="lg" onClick={() => setOpen(false)}><Link href="/products/wigs">Start shopping</Link></Button>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain px-5">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li key={l.key} layout="position" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -32, transition: { duration: 0.18 } }} className="flex gap-4 py-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <ProductImage src={l.image} alt={l.name} sizes="96px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/products/${l.category}/${l.slug}`} onClick={() => setOpen(false)}
                      className="line-clamp-2 font-medium leading-snug hover:underline">{l.name}</Link>
                    {l.variantLabel && <p className="mt-0.5 text-xs text-muted-foreground">{l.variantLabel}</p>}
                    <p className="mt-1 text-sm font-semibold">{formatNaira(l.price)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <button type="button" className={stepper} aria-label={`Decrease quantity of ${l.name}`}
                        onClick={() => setQuantity(l.key, l.quantity - 1)}><Minus className="size-4" /></button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums" aria-live="polite">{l.quantity}</span>
                      <button type="button" className={stepper} aria-label={`Increase quantity of ${l.name}`}
                        disabled={l.quantity >= l.stock} onClick={() => setQuantity(l.key, l.quantity + 1)}><Plus className="size-4" /></button>
                      <button type="button" className="ml-auto flex size-11 items-center justify-center rounded-full text-muted-foreground transition active:scale-90 hover:bg-muted hover:text-destructive md:size-9"
                        aria-label={`Remove ${l.name}`} onClick={() => remove(l.key)}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <footer className="space-y-3 border-t bg-card/60 px-5 pt-4 pb-safe">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-semibold">{formatNaira(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery and payment are arranged with you on WhatsApp.</p>
            <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
              <Link href="/checkout">Checkout · {formatNaira(total)}</Link>
            </Button>
          </footer>
        </>
      )}
    </Sheet>
  )
}
