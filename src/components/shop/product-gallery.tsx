"use client"

import { useEffect, useRef, useState } from "react"
import { ProductImage } from "@/components/ui/product-image"
import { cn } from "@/lib/utils"

/**
 * Swipeable photo strip (native scroll-snap: momentum and edge-bounce feel right on a phone), with dots
 * on phones and thumbnails from `md`. Full-bleed on phones, where the photo is the product.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : [null]
  const many = list.length > 1
  const strip = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const el = strip.current
    if (!el || !many) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { root: el, threshold: 0.6 },
    )
    for (const child of el.children) io.observe(child)
    return () => io.disconnect()
  }, [many])

  const go = (i: number) =>
    strip.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })

  return (
    <section aria-roledescription="carousel" aria-label={`${name} photos`} className="-mx-4 min-w-0 sm:mx-0">
      <div className="relative">
        <ul ref={strip}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((src, i) => (
            <li key={src ?? "placeholder"} data-i={i} aria-roledescription="slide" aria-label={`${i + 1} of ${list.length}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-muted sm:aspect-square">
              <ProductImage src={src} alt={i === 0 ? name : `${name}, photo ${i + 1}`} sizes="(max-width:768px) 100vw, 50vw" priority={i === 0} />
            </li>
          ))}
        </ul>
        {many && (
          <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium tabular-nums backdrop-blur md:hidden" aria-hidden>
            {active + 1} / {list.length}
          </p>
        )}
      </div>

      {many && (
        <>
          <div className="mt-2 flex justify-center md:hidden" role="group" aria-label="Choose photo">
            {list.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === active}
                className="flex size-6 items-center justify-center">
                <span className={cn("block h-1.5 rounded-full transition-all duration-300", i === active ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30")} />
              </button>
            ))}
          </div>
          <div className="mt-3 hidden grid-cols-5 gap-2 md:grid">
            {list.map((src, i) => (
              <button key={src ?? i} type="button" onClick={() => go(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === active}
                className={cn("relative aspect-square overflow-hidden rounded-md border-2 transition-all", i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100")}>
                <ProductImage src={src} alt="" sizes="100px" />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
