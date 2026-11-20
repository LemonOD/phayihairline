import type { Metadata } from "next"
import { BookingForm } from "@/components/booking/booking-form"
import { Container, SectionHeading } from "@/components/ui/section"
import { getServices } from "@/lib/data/services"

export const metadata: Metadata = {
  title: "Book a wig installation in Ikorodu",
  description: "Book your wig installation, styling or customization appointment at our Adamo, Ikorodu studio.",
  alternates: { canonical: "/book" },
}
export const revalidate = 60

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, services] = await Promise.all([searchParams, getServices()])

  return (
    <Container className="max-w-3xl py-12">
      <SectionHeading eyebrow="Appointments" title="Book your session" description="Pick a service, a day and a time. We'll confirm on WhatsApp." />
      <BookingForm services={services} initialSlug={service} />
    </Container>
  )
}
