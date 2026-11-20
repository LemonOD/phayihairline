import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40")} />
      ))}
    </span>
  )
}

/** Compact rating line for cards; renders "New" until a real review exists. */
export function RatingLine({ rating, count }: { rating: number; count: number }) {
  if (count < 1) return <p className="text-xs text-muted-foreground">New</p>
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-accent text-accent" /> {rating.toFixed(1)} <span>({count})</span>
    </div>
  )
}
