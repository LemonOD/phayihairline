import { Badge } from "./badge"

const variants = {
  pending: "warning",
  confirmed: "accent",
  shipped: "accent",
  completed: "success",
  delivered: "success",
  cancelled: "danger",
} as const

export function StatusBadge({ status }: { status: keyof typeof variants }) {
  return <Badge variant={variants[status]} className="capitalize">{status}</Badge>
}
