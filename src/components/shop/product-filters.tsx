"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PRICE_RANGES = [
  { label: "Any price", value: "" },
  { label: "Under ₦10,000", value: "0-10000" },
  { label: "₦10,000 – ₦30,000", value: "10000-30000" },
  { label: "₦30,000 – ₦50,000", value: "30000-50000" },
  { label: "Over ₦50,000", value: "50000-" },
]

const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
]

/** Filters live in the URL: shareable, back-button friendly, and rendered on the server. */
export function ProductFilters({ total }: { total: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(params.get("q") ?? "")

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }, [params, pathname, router])

  useEffect(() => {
    if (search === (params.get("q") ?? "")) return
    const t = setTimeout(() => update("q", search.trim()), 350)
    return () => clearTimeout(t)
  }, [search, params, update])

  const range = `${params.get("min") ?? ""}-${params.get("max") ?? ""}`.replace(/^-$/, "")

  function setRange(value: string) {
    const [min = "", max = ""] = value.split("-")
    const next = new URLSearchParams(params.toString())
    if (min) next.set("min", min)
    else next.delete("min")
    if (max) next.set("max", max)
    else next.delete("max")
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }

  return (
    <div className={cn("mb-8 space-y-4 transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-4 size-4 text-muted-foreground md:left-3 md:top-3" />
          <Input type="search" enterKeyHint="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
            className="pl-10 md:pl-9" aria-label="Search products" />
        </div>
        <Button variant="outline" className="sm:hidden" aria-expanded={open} aria-controls="mobile-filters" onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal /> Filters
        </Button>
        <div className="hidden items-center gap-3 sm:flex">
          <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Price range" className="w-48">
            {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Select value={params.get("sort") ?? "newest"} onChange={(e) => update("sort", e.target.value)}
            aria-label="Sort by" className="w-48">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </div>

      {open && (
        <div id="mobile-filters" className="grid gap-3 sm:hidden">
          <Select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Price range">
            {PRICE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Select value={params.get("sort") ?? "newest"} onChange={(e) => update("sort", e.target.value)} aria-label="Sort by">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      )}
      <p className="text-sm text-muted-foreground" aria-live="polite">{total} product{total === 1 ? "" : "s"}</p>
    </div>
  )
}
