"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { CheckCircle2, MessageCircle } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input, Textarea } from "@/components/ui/input"
import { ProductImage } from "@/components/ui/product-image"
import { placeOrder } from "@/lib/actions/orders"
import { useCart, cartTotal } from "@/stores/cart"
import { track } from "@/lib/analytics"
import { usePrefill } from "@/hooks/use-prefill"
import { useMounted } from "@/hooks/use-mounted"
import { formatNaira } from "@/lib/utils"
import { orderMessage, whatsappLink } from "@/lib/whatsapp"

const phoneRe = /^(\+?234|0)[789][01]\d{8}$/
const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().regex(phoneRe, "Enter a valid Nigerian phone number"),
  address: z.string().trim().min(8, "Enter your delivery address"),
})
type Values = z.infer<typeof schema>

type Placed = { link: string; reference: string }

export function CheckoutForm() {
  const mounted = useMounted()
  const { lines, clear } = useCart()
  const started = useRef(false)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
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
      if (!res.ok || !res.data) return setError(res.ok ? "Something went wrong" : res.error)

      const { reference, total } = res.data
      track("order_placed", { items: lines.length, value: total })
      const message = orderMessage({ ...values, reference, total, items: lines })
      setPlaced({ reference, link: whatsappLink(message) })
      clear()
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Phone number" htmlFor="phone" error={errors.phone?.message} hint="We'll reach you on this number">
          <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field label="Delivery address" htmlFor="address" error={errors.address?.message}>
          <Textarea id="address" autoComplete="street-address" aria-invalid={!!errors.address} {...register("address")} />
        </Field>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={pending}>Place order</Button>
      </form>

      <Card className="h-fit space-y-4 p-5">
        <h2 className="font-sans text-lg font-semibold">Order summary</h2>
        <ul className="space-y-3">
          {mounted && lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3 text-sm">
              <div className="relative size-12 shrink-0 overflow-hidden rounded bg-muted"><ProductImage src={l.image} alt={l.name} sizes="48px" /></div>
              <span className="flex-1">{l.quantity} × {l.name}{l.variantLabel && <span className="block text-xs text-muted-foreground">{l.variantLabel}</span>}</span>
              <span>{formatNaira(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t pt-4 text-lg font-semibold">
          <span>Total</span><span>{formatNaira(mounted ? cartTotal(lines) : 0)}</span>
        </div>
      </Card>
    </div>
  )
}
