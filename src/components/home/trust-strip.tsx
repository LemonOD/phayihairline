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
    <section className="border-y bg-secondary/50 py-8 md:py-10">
      <Container className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4 lg:gap-8">
        {items.map(({ icon: Icon, title, text }) => (
          <Reveal key={title} className="flex flex-col gap-3 md:flex-row md:gap-4">
            <span className="flex size-10 shrink-0 md:size-11 items-center justify-center rounded-full bg-accent/20 text-accent-text"><Icon className="size-5" /></span>
            <div><h2 className="font-sans text-[15px] font-semibold md:text-base">{title}</h2><p className="mt-0.5 text-[13px] leading-snug text-muted-foreground md:text-sm">{text}</p></div>
          </Reveal>
        ))}
      </Container>
    </section>
  )
}
