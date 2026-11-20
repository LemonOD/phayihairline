"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Sheet } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/ui/product-image"
import { useCart, cartTotal } from "@/stores/cart"
import { formatNaira } from "@/lib/utils"

export function CartDrawer() {
  const { lines, open, setOpen, setQuantity, remove } = useCart()
  const total = cartTotal(lines)

  return (
    <Sheet open={open} onOpenChange={setOpen} title="Your cart" description={`${lines.length} item(s)`}>
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <ShoppingBag className="size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild onClick={() => setOpen(false)}><Link href="/products/wigs">Start shopping</Link></Button>
        </div>
      ) : (
        <>
          <ul className="flex-1 space-y-4 overflow-y-auto p-5">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li key={l.key} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24, height: 0 }} className="flex gap-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <ProductImage src={l.image} alt={l.name} sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${l.category}/${l.slug}`} onClick={() => setOpen(false)}
                      className="line-clamp-1 font-medium hover:underline">{l.name}</Link>
                    {l.variantLabel && <p className="text-xs text-muted-foreground">{l.variantLabel}</p>}
                    <p className="text-sm text-muted-foreground">{formatNaira(l.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-7" aria-label="Decrease"
                        onClick={() => setQuantity(l.key, l.quantity - 1)}><Minus /></Button>
                      <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                      <Button variant="outline" size="icon" className="size-7" aria-label="Increase"
                        disabled={l.quantity >= l.stock} onClick={() => setQuantity(l.key, l.quantity + 1)}><Plus /></Button>
                      <Button variant="ghost" size="icon" className="ml-auto size-7" aria-label={`Remove ${l.name}`}
                        onClick={() => remove(l.key)}><Trash2 /></Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <footer className="space-y-3 border-t p-5">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span><span>{formatNaira(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Delivery is arranged with you on WhatsApp.</p>
            <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </footer>
        </>
      )}
    </Sheet>
  )
}
