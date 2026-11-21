"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Check, CheckCircle2, Copy, Mail, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { track } from "@/lib/analytics"
import { formatNaira } from "@/lib/utils"
import type { BankDetails } from "@/lib/validation/schemas"

export type PaidItem = { name: string; price: number; quantity: number; variantLabel?: string | null }
export type Customer = { name: string; phone: string; address: string }

type Props = {
  reference: string
  total: number
  items: PaidItem[]
  customer: Customer
  emailedTo: string | null
  bank: BankDetails | null
  whatsappHref: string
}

/** What the customer is paying for and where it's going: stays on screen while they transfer. */
function OrderSummary({ items, total, customer }: { items: PaidItem[]; total: number; customer: Customer }) {
  return (
    <Card className="p-4 text-left sm:p-5">
      <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your order</h3>
      <ul className="mt-3 space-y-2">
        {items.map((i, n) => (
          <li key={`${i.name}-${n}`} className="flex justify-between gap-3 text-sm">
            <span>
              {i.quantity} × {i.name}
              {i.variantLabel && <span className="block text-xs text-muted-foreground">{i.variantLabel}</span>}
            </span>
            <span className="shrink-0 font-medium">{formatNaira(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
        <span>Total</span><span>{formatNaira(total)}</span>
      </div>
      <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
        Delivering to <strong className="text-foreground">{customer.name}</strong>, {customer.phone}
        <span className="block">{customer.address}</span>
      </p>
    </Card>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Couldn't copy. Please type it in.")
    }
  }
  return (
    <button type="button" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}
      className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95">
      {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  )
}

function Row({ label, value, copy, strong }: { label: string; value: string; copy?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 text-left">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className={strong ? "break-all text-xl font-semibold tracking-wide" : "font-medium"}>{value}</dd>
      </div>
      {copy && <CopyButton value={copy} label={label} />}
    </div>
  )
}

/** Shown after an order is saved: pay into the shop account, then confirm on WhatsApp. */
export function PaymentStep({ reference, total, items, customer, bank, emailedTo, whatsappHref }: Props) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md space-y-5 py-10 text-center">
      <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
      <h2 className="text-3xl font-semibold">Order {reference} received</h2>
      <OrderSummary items={items} total={total} customer={customer} />

      {bank ? (
        <>
          <p className="text-muted-foreground">
            Transfer <strong className="text-foreground">{formatNaira(total)}</strong> to the account below, then
            tap the button to send us your receipt on WhatsApp. Your order details go with it.
          </p>
          <Card className="p-4 sm:p-5">
            <dl className="divide-y">
              <Row label="Bank" value={bank.bankName} />
              <Row label="Account name" value={bank.accountName} copy={bank.accountName} />
              <Row label="Account number" value={bank.accountNumber} copy={bank.accountNumber} strong />
              <Row label="Amount" value={formatNaira(total)} copy={String(total)} />
            </dl>
            <p className="pt-3 text-left text-sm text-muted-foreground">
              Use <strong className="text-foreground">{reference}</strong> as the transfer description so we can match your payment.
            </p>
          </Card>
          <Button asChild size="lg" variant="accent" className="w-full">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { from: "checkout_paid" })}>
              <MessageCircle /> I&apos;ve paid, continue on WhatsApp
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Take a screenshot of these details now. We confirm your order and arrange delivery once we see your receipt.
          </p>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">One last step: send your order to us on WhatsApp so we can confirm payment and delivery.</p>
          <Button asChild size="lg" variant="accent" className="w-full">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { from: "checkout" })}>
              <MessageCircle /> Continue on WhatsApp
            </a>
          </Button>
        </>
      )}
      {emailedTo && (
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0" aria-hidden /> We&apos;re also emailing these details to {emailedTo}
        </p>
      )}
      <Button asChild variant="ghost"><Link href="/">Back to home</Link></Button>
    </motion.div>
  )
}
