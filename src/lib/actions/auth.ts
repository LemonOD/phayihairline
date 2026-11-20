"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { emailSchema, loginSchema, passwordSchema, registerSchema } from "@/lib/validation/schemas"
import { fail, validationError } from "./helpers"
import type { ActionResult } from "@/types"

const safeNext = (next?: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/account")

async function origin() {
  const h = await headers()
  return h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export async function signIn(input: unknown, next?: string | null): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return fail("Incorrect email or password")
  redirect(safeNext(next))
}

export async function signUp(input: unknown): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const { email, password, fullName, phone } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone || null },
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  })
  if (error) return fail(error.message)
  if (data.session) redirect("/account")
  return { ok: true, data: { needsConfirmation: true } }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}/auth/callback?next=/update-password`,
  })
  // Always succeed so account existence is not leaked.
  return { ok: true }
}

export async function updatePassword(input: unknown): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) return validationError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return fail(error.message)
  redirect("/account")
}
