import { formatNaira, siteConfig } from "@/lib/utils"
import type { OrderItem } from "@/types"

export function whatsappLink(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`
}

export function orderMessage(args: {
  reference: string
  name: string
  phone: string
  address: string
  items: (Pick<OrderItem, "name" | "price" | "quantity"> & { variantLabel?: string | null })[]
  total: number
}) {
  const lines = args.items.map((i) => `• ${i.quantity} × ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} — ${formatNaira(i.price * i.quantity)}`)
  return [
    `Hello ${siteConfig.name}! I'd like to complete my order *${args.reference}*.`,
    "",
    ...lines,
    "",
    `Total: *${formatNaira(args.total)}*`,
    `Name: ${args.name}`,
    `Phone: ${args.phone}`,
    `Delivery: ${args.address}`,
  ].join("\n")
}
