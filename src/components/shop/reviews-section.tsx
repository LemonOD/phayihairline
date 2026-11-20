import { BadgeCheck } from "lucide-react"
import { ReviewGate } from "./review-gate"
import { StarRating } from "./star-rating"
import { Reveal } from "@/components/ui/motion"
import { getReviews, summarize } from "@/lib/data/reviews"
import type { Product } from "@/types"

const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" })

export async function ReviewsSection({ product }: { product: Product }) {
  const reviews = await getReviews(product.id)
  const counts = summarize(reviews)

  return (
    <section id="reviews" className="mt-20 scroll-mt-24">
      <h2 className="mb-6 text-2xl font-semibold">Customer reviews</h2>
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          {reviews.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-serif text-5xl font-semibold">{product.rating.toFixed(1)}</span>
                <div><StarRating value={product.rating} /><p className="text-sm text-muted-foreground">{product.review_count} review{product.review_count === 1 ? "" : "s"}</p></div>
              </div>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${((counts[star - 1] ?? 0) / reviews.length) * 100}%` }} />
                  </div>
                  <span className="w-5 text-right text-muted-foreground">{counts[star - 1]}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No reviews yet. Be the first once you&apos;ve received your order.</p>}

          <ReviewGate productId={product.id} />
        </div>

        <ul className="space-y-6">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={Math.min(i, 4) * 0.05} className="border-b pb-6 last:border-0">
              <li>
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating value={r.rating} />
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><BadgeCheck className="size-3.5" /> Verified buyer</span>
                </div>
                {r.title && <h3 className="mt-2 font-sans font-semibold">{r.title}</h3>}
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{r.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{r.author_name} · {dateFmt.format(new Date(r.created_at))}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
