"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/lib/actions/admin"

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <Button variant="ghost" size="icon" loading={pending} aria-label={`Delete ${name}`}
      onClick={() => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) return
        start(async () => {
          const res = await deleteProduct(id)
          if (res.ok) { toast.success("Product deleted"); router.refresh() } else toast.error(res.error)
        })
      }}>
      {!pending && <Trash2 />}
    </Button>
  )
}
