import type { ZodError } from "zod"
import type { ActionFailure } from "@/types"

export function validationError(error: ZodError): ActionFailure {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>
  const first = Object.values(fieldErrors).flat()[0]
  return { ok: false, error: first ?? "Please check your details", fieldErrors }
}

export const fail = (error: string): ActionFailure => ({ ok: false, error })

/** A write that matched no rows (stale id, already deleted) is a failure, not a success. */
export const missing = (what: string) => fail(`${what} not found`)

/** Postgres/PostgREST report "that function doesn't exist" when a migration hasn't been applied yet. */
export const isMissingFunction = (error: { code?: string } | null) => error?.code === "PGRST202" || error?.code === "42883"
