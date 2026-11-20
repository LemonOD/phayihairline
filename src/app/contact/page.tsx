import type { Metadata } from "next"
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { ContactForm } from "@/components/layout/contact-form"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/ui/motion"
import { Container, SectionHeading } from "@/components/ui/section"
import { siteConfig } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

export const metadata: Metadata = { title: "Contact us" }

const info = [
  { icon: MapPin, title: "Visit us", text: siteConfig.address },
  { icon: Phone, title: "Call", text: siteConfig.phone },
  { icon: Mail, title: "Email", text: siteConfig.email },
  { icon: Clock, title: "Hours", text: "Mon – Sat, 9:00am – 6:00pm" },
]

export default function ContactPage() {
  return (
    <PageTransition>
      <Container className="py-12">
        <SectionHeading eyebrow="Get in touch" title="We'd love to hear from you" />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            {info.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent"><Icon className="size-5" /></span>
                <div><h3 className="font-sans font-semibold">{title}</h3><p className="text-muted-foreground">{text}</p></div>
              </div>
            ))}
            <Button asChild variant="accent" size="lg">
              <a href={whatsappLink("Hello PhayiHairline!")} target="_blank" rel="noopener noreferrer"><MessageCircle /> Chat on WhatsApp</a>
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-6"><ContactForm /></div>
        </div>
      </Container>
    </PageTransition>
  )
}
