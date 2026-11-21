import Link from "next/link"
import { BrandMark } from "@/components/layout/brand-mark"

export function AdminBrand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/admin" onClick={onNavigate} className="flex min-h-11 items-center gap-2.5">
      <BrandMark />
      <span className="font-serif text-lg font-semibold tracking-tight">Phayi<span className="text-accent-text">Hairline</span></span>
      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-text">Admin</span>
    </Link>
  )
}
