"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteService } from "@/lib/actions/admin"

export function DeleteServiceButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <Button variant="ghost" size="icon" loading={pending} aria-label={`Delete ${name}`}
      onClick={() => {
        if (!confirm(`Delete "${name}"?`)) return
        start(async () => {
          const res = await deleteService(id)
          if (res.ok) { toast.success("Service deleted"); router.refresh() } else toast.error(res.error)
        })
      }}>
      {!pending && <Trash2 />}
    </Button>
  )
}
