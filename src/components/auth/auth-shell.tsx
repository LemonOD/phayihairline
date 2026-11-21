import Link from "next/link"
import { BrandMark } from "@/components/layout/brand-mark"

/** The form column inside the (access) layout. The brand mark only shows on phones, where the photo panel is hidden. */
export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode
}) {
  return (
    <div className="rise-lift w-full max-w-md">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-serif text-2xl font-semibold tracking-tight lg:hidden">
        <BrandMark size={40} />
        <span>Phayi<span className="text-accent-text">Hairline</span></span>
      </Link>
      <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
    </div>
  )
}
