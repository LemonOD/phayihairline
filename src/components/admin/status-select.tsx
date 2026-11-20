"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Select } from "@/components/ui/input"
import type { ActionResult } from "@/types"

type Props<T extends string> = {
  id: string
  value: T
  options: readonly T[]
  action: (id: string, status: T) => Promise<ActionResult>
}

export function StatusSelect<T extends string>({ id, value, options, action }: Props<T>) {
  const [pending, start] = useTransition()
  return (
    <Select value={value} disabled={pending} aria-label="Status" className="h-8 w-36 text-xs capitalize"
      onChange={(e) => start(async () => {
        const res = await action(id, e.target.value as T)
        if (res.ok) toast.success("Status updated")
        else toast.error(res.error)
      })}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </Select>
  )
}
