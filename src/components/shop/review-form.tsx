"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { submitReview } from "@/lib/actions/reviews"
import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await submitReview({ productId, rating, title, body })
      if (!res.ok) {
        setError(res.error)
        return
      }
      track("review_submitted", { rating })
      toast.success("Thanks for your review!")
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-5">
      <h3 className="font-sans text-lg font-semibold">Write a review</h3>
      {/* Native radios: arrow keys, a single tab stop and screen-reader semantics come for free. */}
      <fieldset onMouseLeave={() => setHover(0)}>
        <legend className="sr-only">Rating</legend>
        <div className="-ml-1 flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)}
                className="peer sr-only" aria-label={`${n} star${n > 1 ? "s" : ""}`} />
              <span className="block rounded-md p-1.5 transition active:scale-90 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                <Star className={cn("size-9 transition-colors duration-150", n <= (hover || rating) ? "fill-accent text-accent-text" : "text-muted-foreground/40")} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Headline (optional)" aria-label="Review headline" />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000}
        placeholder="How was the quality, fit and finish?" aria-label="Your review" />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full sm:w-auto" loading={pending}>Submit review</Button>
    </form>
  )
}
