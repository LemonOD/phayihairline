import type { Metadata } from "next"
import { BookingForm } from "@/components/booking/booking-form"
import { Container, SectionHeading } from "@/components/ui/section"
import { getServices } from "@/lib/data/services"
import { getSession } from "@/lib/data/session"

export const metadata: Metadata = { title: "Book an appointment" }

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, services, { profile, user }] = await Promise.all([searchParams, getServices(), getSession()])

  return (
    <Container className="max-w-3xl py-12">
      <SectionHeading eyebrow="Appointments" title="Book your session" description="Pick a service, a day and a time. We'll confirm on WhatsApp." />
      <BookingForm
        services={services}
        initialSlug={service}
        defaults={{ name: profile?.full_name ?? "", phone: profile?.phone ?? "", email: user?.email ?? "" }}
      />
    </Container>
  )
}
