"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { signIn } from "@/lib/actions/auth"
import { loginSchema } from "@/lib/validation/schemas"
import { useActionForm } from "@/hooks/use-action-form"
import type { z } from "zod"

type Values = z.infer<typeof loginSchema>

export function LoginForm({ next }: { next?: string }) {
  const { pending, error, run } = useActionForm<undefined>()
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(loginSchema) })

  return (
    <form onSubmit={handleSubmit((v) => run(() => signIn(v, next)))} className="space-y-4" noValidate>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
      </Field>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" loading={pending}>Sign in</Button>
    </form>
  )
}
