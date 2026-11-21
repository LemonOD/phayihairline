"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/confirm"
import { deleteReview, setReviewStatus } from "@/lib/actions/reviews"

export function ReviewActions({ id, status }: { id: string; status: "published" | "hidden" }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const confirm = useConfirm()

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
      <Button size="icon" variant="ghost" aria-label="Delete review" disabled={pending}
        onClick={async () => {
          const ok = await confirm({
            title: "Delete this review?",
            description: "It's removed permanently. Hide it instead if you might want it back.",
            confirmLabel: "Delete review",
          })
          if (ok) run(() => deleteReview(id), "Deleted")
        }}>
        <Trash2 />
      </Button>
    </div>
  )
}
