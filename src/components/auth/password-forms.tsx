"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requestPasswordReset, updatePassword } from "@/lib/actions/auth"
import { emailSchema, passwordSchema } from "@/lib/validation/schemas"
import { useActionForm } from "@/hooks/use-action-form"
import type { z } from "zod"

export function ForgotPasswordForm() {
  const { pending, error, run } = useActionForm<undefined>()
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  })

  if (isSubmitSuccessful && !error && !pending) {
    return (
      <div className="space-y-3 py-4 text-center">
        <MailCheck className="mx-auto size-12 text-accent-text" />
        <p className="text-sm text-muted-foreground">If an account exists for that email, a reset link is on its way.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => run(() => requestPasswordReset(v)))} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" loading={pending}>Send reset link</Button>
    </form>
  )
}

export function UpdatePasswordForm() {
  const { pending, error, run } = useActionForm<undefined>()
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  })

  return (
    <form onSubmit={handleSubmit((v) => run(() => updatePassword(v)))} className="space-y-4" noValidate>
      <Field label="New password" htmlFor="password" error={errors.password?.message}>
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
        <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" loading={pending}>Update password</Button>
    </form>
  )
}
