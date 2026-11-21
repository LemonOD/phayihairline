import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrandMark } from "@/components/layout/brand-mark"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { siteConfig } from "@/lib/utils"

/**
 * Sign in, register and password pages. A focused frame with no storefront navigation or footer:
 * brand photography beside the form on desktop, a clean single column on phones.
 */
export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#14100e] text-white lg:block">
        <Image src="/brand/brand-portrait-bags.jpg" alt="" fill priority sizes="55vw" className="object-cover object-[50%_20%] opacity-90" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="flex w-fit items-center gap-2.5 font-serif text-2xl font-semibold tracking-tight">
            <BrandMark size={40} />
            <span>Phayi<span className="text-[#e0b565]">Hairline</span></span>
          </Link>
          <div className="max-w-md">
            <p className="font-serif text-4xl leading-[1.1] xl:text-5xl">
              Luxury hair, <em className="text-[#e0b565]">affordably</em> yours.
            </p>
            <p className="mt-4 text-base text-white/80">{siteConfig.tagline}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-3 sm:px-8">
          <Link href="/" className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Back to store
          </Link>
          <ThemeToggle />
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-5 pb-12 pt-2 outline-none sm:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
