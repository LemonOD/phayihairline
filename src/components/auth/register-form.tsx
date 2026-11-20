"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/actions/auth"
import { registerSchema } from "@/lib/validation/schemas"
import { useActionForm } from "@/hooks/use-action-form"
import type { z } from "zod"

type Values = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { pending, error, data, run } = useActionForm<{ needsConfirmation: boolean }>()
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(registerSchema) })

  if (data?.needsConfirmation) {
    return (
      <div className="space-y-3 py-4 text-center">
        <MailCheck className="mx-auto size-12 text-accent-text" />
        <p className="font-medium">Check your inbox</p>
        <p className="text-sm text-muted-foreground">We sent a confirmation link. Open it to activate your account.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => run(() => signUp(v)))} className="space-y-4" noValidate>
      <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
        <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters">
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" loading={pending}>Create account</Button>
    </form>
  )
}
