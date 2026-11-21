import { OrderStatusSelect } from "@/components/admin/order-status"
import { Card } from "@/components/ui/card"
import { getAdminOrders } from "@/lib/data/admin"
import { formatNaira } from "@/lib/utils"

export const metadata = { title: "Orders" }
const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })

export default async function AdminOrders() {
  const orders = await getAdminOrders()
  return (
    <>
      <h1 className="mb-5 text-2xl font-semibold sm:mb-6 sm:text-3xl">Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <Card className="p-6 text-muted-foreground">No orders yet.</Card>}
        {orders.map((o) => (
          <Card key={o.id} className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{o.reference} · {formatNaira(o.total)}</p>
                <p className="text-sm text-muted-foreground">{dateFmt.format(new Date(o.created_at))}</p>
              </div>
              <OrderStatusSelect id={o.id} value={o.status} />
            </div>
            <ul className="text-sm">{o.items.map((i) => <li key={`${i.product_id}${i.variant_id ?? ""}`}>{i.quantity} × {i.name}{i.variant && ` (${i.variant})`}</li>)}</ul>
            <p className="text-sm text-muted-foreground">
              {o.customer_name} · <a className="underline" href={`tel:${o.customer_phone}`}>{o.customer_phone}</a> · {o.delivery_address}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
