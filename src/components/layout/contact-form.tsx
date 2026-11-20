"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input, Textarea } from "@/components/ui/input"
import { sendContactMessage } from "@/lib/actions/contact"
import { contactSchema } from "@/lib/validation/schemas"
import { useActionForm } from "@/hooks/use-action-form"
import type { z } from "zod"

type Values = z.infer<typeof contactSchema>

export function ContactForm() {
  const { pending, error, run } = useActionForm<undefined>()
  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm<Values>({
    resolver: zodResolver(contactSchema),
  })

  if (isSubmitSuccessful && !error && !pending) {
    return (
      <div className="space-y-3 py-10 text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
        <p className="font-medium">Thanks, your message is on its way!</p>
        <Button variant="ghost" onClick={() => reset()}>Send another</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => run(() => sendContactMessage(v)))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors.name?.message}><Input id="name" autoComplete="name" {...register("name")} /></Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="email" {...register("email")} /></Field>
      </div>
      <Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" {...register("phone")} /></Field>
      <Field label="Message" htmlFor="message" error={errors.message?.message}><Textarea id="message" rows={5} {...register("message")} /></Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" loading={pending}><Send /> Send message</Button>
    </form>
  )
}
