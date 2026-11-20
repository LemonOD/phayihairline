"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteReview, setReviewStatus } from "@/lib/actions/reviews"

export function ReviewActions({ id, status }: { id: string; status: "published" | "hidden" }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const res = await fn()
      if (res.ok) { toast.success(done); router.refresh() } else toast.error(res.error ?? "Failed")
    })

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" disabled={pending}
        onClick={() => run(() => setReviewStatus(id, status === "published" ? "hidden" : "published"), "Updated")}>
        {status === "published" ? <><EyeOff /> Hide</> : <><Eye /> Show</>}
      </Button>
      <Button size="icon" variant="ghost" className="size-8" aria-label="Delete review" disabled={pending}
        onClick={() => confirm("Delete this review permanently?") && run(() => deleteReview(id), "Deleted")}>
        <Trash2 />
      </Button>
    </div>
  )
}
