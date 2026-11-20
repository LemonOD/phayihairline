import { BadgeCheck, Scissors, Truck } from "lucide-react"
import { Reveal } from "@/components/ui/motion"
import { Container } from "@/components/ui/section"

const items = [
  { icon: BadgeCheck, title: "100% quality hair", text: "Carefully sourced human hair, inspected before it reaches you." },
  { icon: Scissors, title: "Expert installation", text: "Book a stylist at our Ikorodu studio for a flawless, natural finish." },
  { icon: Truck, title: "Delivery across Nigeria", text: "Order online and finish up with us on WhatsApp." },
]

export function TrustStrip() {
  return (
    <section className="border-y bg-secondary/50 py-10">
      <Container className="grid gap-8 md:grid-cols-3">
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
