import type { Metadata } from "next"
import Link from "next/link"
import { Check, Clock } from "lucide-react"
import { JsonLd } from "@/components/layout/json-ld"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageTransition, Reveal, Stagger, StaggerItem } from "@/components/ui/motion"
import { Container, SectionHeading } from "@/components/ui/section"
import { getServices } from "@/lib/data/services"
import { formatNaira, siteConfig } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Wig Installation in Lagos",
  description: "Professional wig installation, customization, styling and maintenance in Lagos.",
}
export const revalidate = 60

const duration = (m: number) => (m < 60 ? `${m} min` : `${m / 60} hr${m / 60 === 1 ? "" : "s"}`)

const steps = [
  ["Consultation", "We discuss your look, lifestyle and hair goals."],
  ["Preparation", "Your wig and hairline are prepped for a seamless blend."],
  ["Installation", "Secure, comfortable and natural-looking application."],
  ["Styling", "A finishing style and aftercare advice to take home."],
]

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <PageTransition>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: services.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: s.name,
            description: s.description,
            areaServed: "Ikorodu, Lagos",
            provider: { "@id": `${siteConfig.url}/#business` },
            offers: { "@type": "Offer", price: s.price, priceCurrency: "NGN" },
          },
        })),
      }} />
      <Container className="py-12">
        <SectionHeading eyebrow="Studio services" title="Professional wig services"
          description="Book a slot with our stylists in Lagos and walk out feeling like yourself, only better." />

        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.id}>
              <Card className="flex h-full flex-col p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold">{s.name}</h3>
                  <span className="text-lg font-semibold text-accent-text">{formatNaira(s.price)}</span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-3.5" /> {duration(s.duration_minutes)}</p>
                <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {s.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm"><Check className="size-4 text-accent-text" /> {f}</li>)}
                </ul>
                <Button asChild className="mt-6"><Link href={`/book?service=${s.slug}`}>Book now</Link></Button>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-24">
          <SectionHeading title="How it works" />
          <ol className="grid gap-6 md:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title} className="text-center">
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary font-serif text-lg text-primary-foreground">{i + 1}</span>
                <h3 className="font-sans font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </PageTransition>
  )
}
