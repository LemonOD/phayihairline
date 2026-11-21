"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/confirm"
import { deleteProduct } from "@/lib/actions/admin"

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const confirm = useConfirm()

  return (
    <Button variant="ghost" size="icon" loading={pending} aria-label={`Delete ${name}`}
      onClick={async () => {
        const ok = await confirm({
          title: `Delete “${name}”?`,
          description: "This removes the product and its variants. It can't be undone.",
          confirmLabel: "Delete product",
        })
        if (!ok) return
        start(async () => {
          const res = await deleteProduct(id)
          if (res.ok) { toast.success("Product deleted"); router.refresh() } else toast.error(res.error)
        })
      }}>
      {!pending && <Trash2 />}
    </Button>
  )
}
