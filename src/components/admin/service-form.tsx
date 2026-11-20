"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input, Textarea } from "@/components/ui/input"
import { saveService } from "@/lib/actions/admin"
import type { Service } from "@/types"

type Values = {
  name: string; description: string; price: string; duration_minutes: string
  features: string; sort_order: string; is_active: boolean
}

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const { register, handleSubmit } = useForm<Values>({
    defaultValues: {
      name: service?.name ?? "", description: service?.description ?? "",
      price: String(service?.price ?? ""), duration_minutes: String(service?.duration_minutes ?? 60),
      features: service?.features.join("\n") ?? "", sort_order: String(service?.sort_order ?? 0),
      is_active: service?.is_active ?? true,
    },
  })

  const onSubmit = (v: Values) =>
    start(async () => {
      const res = await saveService(service?.id ?? null, {
        ...v,
        features: v.features.split("\n").map((f) => f.trim()).filter(Boolean),
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Service saved")
      router.push("/admin/services")
      router.refresh()
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <Field label="Name" htmlFor="name"><Input id="name" required {...register("name")} /></Field>
      <Field label="Description" htmlFor="description"><Textarea id="description" {...register("description")} /></Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Price (₦)" htmlFor="price"><Input id="price" type="number" min={0} required {...register("price")} /></Field>
        <Field label="Duration (min)" htmlFor="duration" hint="Rounded up to whole hours for slots">
          <Input id="duration" type="number" min={15} step={15} required {...register("duration_minutes")} />
        </Field>
        <Field label="Sort order" htmlFor="sort"><Input id="sort" type="number" {...register("sort_order")} /></Field>
      </div>
      <Field label="What's included" htmlFor="features" hint="One per line"><Textarea id="features" rows={4} {...register("features")} /></Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--accent)]" {...register("is_active")} /> Bookable (visible on the site)
      </label>
      <div className="flex gap-3">
        <Button type="submit" loading={pending}>Save service</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
