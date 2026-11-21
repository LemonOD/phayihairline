"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronDown, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input, Textarea } from "@/components/ui/input"
import { ProductImage } from "@/components/ui/product-image"
import { placeOrder } from "@/lib/actions/orders"
import { checkoutFormSchema } from "@/lib/validation/schemas"
import { useCart, cartTotal } from "@/stores/cart"
import { track } from "@/lib/analytics"
import { usePrefill } from "@/hooks/use-prefill"
import { useMounted } from "@/hooks/use-mounted"
import { cn, formatNaira } from "@/lib/utils"
import { orderMessage, whatsappLink } from "@/lib/whatsapp"

type Values = z.infer<typeof checkoutFormSchema>

type Placed = { link: string; reference: string }

export function CheckoutForm() {
  const mounted = useMounted()
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)
  const started = useRef(false)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(true) // show what they are buying up front; tap the total to collapse
  const [pending, start] = useTransition()
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { name: "", phone: "", address: "" },
  })
  usePrefill((p) => {
    if (!getValues("name")) setValue("name", p.name)
    if (!getValues("phone")) setValue("phone", p.phone)
  })

  useEffect(() => {
    if (!mounted || started.current || lines.length === 0) return
    started.current = true
    track("begin_checkout", { items: lines.length, value: cartTotal(lines) })
  }, [mounted, lines])

  if (placed) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md space-y-5 py-10 text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h2 className="text-3xl font-semibold">Order {placed.reference} received</h2>
        <p className="text-muted-foreground">One last step: send your order to us on WhatsApp so we can confirm payment and delivery.</p>
        <Button asChild size="lg" variant="accent" className="w-full">
          <a href={placed.link} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { from: "checkout" })}><MessageCircle /> Continue on WhatsApp</a>
        </Button>
        <Button asChild variant="ghost"><Link href="/">Back to home</Link></Button>
      </motion.div>
    )
  }

  if (mounted && lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
        <Button asChild><Link href="/products/wigs">Browse products</Link></Button>
      </div>
    )
  }

  const onSubmit = (values: Values) => {
    setError(null)
    start(async () => {
      const items = lines.map((l) => ({ product_id: l.id, variant_id: l.variantId, quantity: l.quantity }))
      const res = await placeOrder({ ...values, items })
      if (!res.ok) return setError(res.error)

      const { reference, total, items: priced } = res.data
      track("order_placed", { items: lines.length, value: total })
      // Prefer the lines the server actually charged; the saved cart can hold stale prices.
      const charged = priced?.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, variantLabel: i.variant ?? null }))
      const message = orderMessage({ ...values, reference, total, items: charged ?? lines })
      setPlaced({ reference, link: whatsappLink(message) })
      clear()
    })
  }

  const total = mounted ? cartTotal(lines) : 0

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:gap-8 lg:pb-0">
      {/* First on phones (what am I paying for?), second column on desktop. */}
      <aside className="lg:col-start-2 lg:row-start-1">
        <Card className="h-fit p-4 sm:p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-sans text-lg font-semibold">Order summary</h2>
            <button type="button" aria-expanded={showSummary} aria-controls="order-summary-body"
              onClick={() => setShowSummary((v) => !v)}
              className="-mr-2 flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-semibold transition active:scale-95 lg:hidden">
              {formatNaira(total)}
              <ChevronDown className={cn("size-4 transition-transform duration-200", showSummary && "rotate-180")} aria-hidden />
            </button>
          </div>
          <div id="order-summary-body" className={cn("mt-4 space-y-4", showSummary ? "block" : "hidden", "lg:block")}>
            <ul className="space-y-3">
              {mounted && lines.map((l) => (
                <li key={l.key} className="flex items-center gap-3 text-sm">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted"><ProductImage src={l.image} alt={l.name} sizes="56px" /></div>
                  <span className="flex-1">{l.quantity} × {l.name}{l.variantLabel && <span className="block text-xs text-muted-foreground">{l.variantLabel}</span>}</span>
                  <span className="font-medium">{formatNaira(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t pt-4 text-lg font-semibold">
              <span>Total</span><span>{formatNaira(total)}</span>
            </div>
          </div>
        </Card>
      </aside>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 lg:col-start-1 lg:row-start-1" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" enterKeyHint="next" {...register("name")} />
        </Field>
        <Field label="Phone number" htmlFor="phone" error={errors.phone?.message} hint="We'll reach you on this number">
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" {...register("phone")} />
        </Field>
        <Field label="Delivery address" htmlFor="address" error={errors.address?.message}>
          <Textarea id="address" autoComplete="street-address" {...register("address")} />
        </Field>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="hidden w-full lg:inline-flex" loading={pending}>Place order</Button>
      </form>

      {/* Thumb-reach submit on phones; the inline button above takes over from `lg`. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-3 pb-safe-sm backdrop-blur lg:hidden">
        <Button type="submit" form="checkout-form" size="lg" className="w-full" loading={pending}>
          Place order · {formatNaira(total)}
        </Button>
      </div>
    </div>
  )
}
