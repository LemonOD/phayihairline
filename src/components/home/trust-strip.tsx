import { BadgeCheck, Gem, Tag, Truck } from "lucide-react"
import { Reveal } from "@/components/ui/motion"
import { Container } from "@/components/ui/section"

const items = [
  { icon: Gem, title: "Premium quality", text: "Virgin and raw donor hair, checked before it reaches you." },
  { icon: Tag, title: "Affordable luxury", text: "Long-lasting, soft, natural-looking hair at a price you will love." },
  { icon: BadgeCheck, title: "Custom and revamping", text: "Custom wigs made to order, plus revamping and rewigging of your units." },
  { icon: Truck, title: "Worldwide shipping", text: "We ship to Nigeria, the US, the UK and beyond. Order online and finish up with us on WhatsApp." },
]

export function TrustStrip() {
  return (
    <section className="border-y bg-secondary/50 py-10">
      <Container className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.1} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-text"><Icon className="size-5" /></span>
            <div><h2 className="font-sans text-base font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{text}</p></div>
          </Reveal>
        ))}
      </Container>
    </section>
  )
}
