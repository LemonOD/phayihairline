import Link from "next/link"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Container } from "@/components/ui/section"
import { BrandMark } from "./brand-mark"
import { navLinks } from "./nav-links"
import { socialIcons } from "./social-icons"
import { siteConfig } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-3">
          <p className="flex items-center gap-3 font-serif text-2xl font-semibold"><BrandMark size={40} />Phayi<span className="text-accent-text -ml-2.5">Hairline</span></p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Luxury hair extensions and wigs. Virgin and raw donor hair, bundles, closures, frontals and revamping, at a price you will love. Slay and save.
          </p>
          <div className="flex gap-3 pt-1">
            <a href={whatsappLink("Hello PhayiHairline!")} aria-label="Chat on WhatsApp" className="flex size-11 items-center justify-center rounded-full border transition active:scale-95 hover:bg-muted">
              <MessageCircle className="size-4" />
            </a>
            {siteConfig.socials.map(({ platform, url }) => {
              const { Icon, label } = socialIcons[platform]
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}
                  className="flex size-11 items-center justify-center rounded-full border transition active:scale-95 hover:bg-muted">
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-4 text-sm">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="tap text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
          ))}
        </nav>

        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2"><MapPin className="size-4 shrink-0 text-accent-text" /> {siteConfig.address}</li>
          <li className="flex gap-2"><Phone className="size-4 shrink-0 text-accent-text" /> {siteConfig.phone} · {siteConfig.phone2}</li>
          <li className="flex gap-2"><Mail className="size-4 shrink-0 text-accent-text" /> {siteConfig.email}</li>
        </ul>
      </Container>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  )
}
