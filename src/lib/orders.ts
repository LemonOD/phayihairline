import { z } from "zod"
import type { Database } from "@/types/database"
import type { Order, OrderItem } from "@/types"

/** Shape of an order line as written by `place_order()`; also what the WhatsApp message is built from. */
const orderItemSchema = z.object({
  product_id: z.string(),
  variant_id: z.string().nullish(),
  variant: z.string().nullish(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().nullable().default(null),
})

/** `orders.items` comes back as untyped JSON. Anything that doesn't fit is dropped rather than trusted. */
export function parseOrderItems(json: unknown): OrderItem[] {
  const parsed = z.array(orderItemSchema).safeParse(json)
  return parsed.success ? parsed.data : []
}

export const toOrder = (row: Database["public"]["Tables"]["orders"]["Row"]): Order => ({
  ...row,
  items: parseOrderItems(row.items),
})
