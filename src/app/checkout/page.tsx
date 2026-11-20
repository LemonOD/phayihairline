import type { Metadata } from "next"
import { CheckoutForm } from "@/components/shop/checkout-form"
import { Container } from "@/components/ui/section"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default function CheckoutPage() {
  return (
    <Container className="max-w-5xl py-12">
      <h1 className="mb-8 text-4xl font-semibold">Checkout</h1>
      <CheckoutForm />
    </Container>
  )
}
