import type { ZodError } from "zod"
import type { ActionResult } from "@/types"

export function validationError(error: ZodError): ActionResult {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>
  const first = Object.values(fieldErrors).flat()[0]
  return { ok: false, error: first ?? "Please check your details", fieldErrors }
}

export const fail = (error: string): ActionResult => ({ ok: false, error })
