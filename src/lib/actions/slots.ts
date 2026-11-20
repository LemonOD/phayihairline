"use server"

import { z } from "zod"
import { buildSlots, getTakenSlots } from "@/lib/data/slots"

const input = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), durationMinutes: z.number().int().min(15).max(600) })

export type Slot = { hour: number; iso: string; available: boolean }

export async function getAvailableSlots(date: string, durationMinutes: number): Promise<Slot[]> {
  const parsed = input.safeParse({ date, durationMinutes })
  if (!parsed.success) return []
  return buildSlots(parsed.data.date, parsed.data.durationMinutes, await getTakenSlots(parsed.data.date))
}
