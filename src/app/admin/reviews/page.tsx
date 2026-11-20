import { ReviewActions } from "@/components/admin/review-actions"
import { StarRating } from "@/components/shop/star-rating"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getAdminReviews } from "@/lib/data/reviews"

export const metadata = { title: "Reviews" }
const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" })

export default async function AdminReviews() {
  const reviews = await getAdminReviews()
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Reviews</h1>
      <div className="space-y-4">
        {reviews.length === 0 && <Card className="p-6 text-muted-foreground">No reviews yet.</Card>}
        {reviews.map((r) => (
          <Card key={r.id} className="space-y-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.product?.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <StarRating value={r.rating} size="size-3.5" /> {r.author_name} · {dateFmt.format(new Date(r.created_at))}
                  {r.status === "hidden" && <Badge variant="muted">Hidden</Badge>}
                </div>
              </div>
              <ReviewActions id={r.id} status={r.status} />
            </div>
            {r.title && <p className="font-medium">{r.title}</p>}
            <p className="whitespace-pre-wrap text-sm">{r.body}</p>
          </Card>
        ))}
      </div>
    </>
  )
}
