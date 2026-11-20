import type { Metadata } from "next"
import { CheckoutForm } from "@/components/shop/checkout-form"
import { Container } from "@/components/ui/section"
import { getSession } from "@/lib/data/session"

export const metadata: Metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const { profile } = await getSession()
  return (
    <Container className="max-w-5xl py-12">
      <h1 className="mb-8 text-4xl font-semibold">Checkout</h1>
      <CheckoutForm defaults={{ name: profile?.full_name ?? "", phone: profile?.phone ?? "" }} />
    </Container>
  )
}
