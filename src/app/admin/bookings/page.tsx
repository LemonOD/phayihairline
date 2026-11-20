import { BookingStatusSelect } from "@/components/admin/order-status"
import { Card } from "@/components/ui/card"
import { getAdminBookings } from "@/lib/data/admin"

export const metadata = { title: "Bookings" }
const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" })

export default async function AdminBookings() {
  const bookings = await getAdminBookings()
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Bookings</h1>
      <div className="space-y-4">
        {bookings.length === 0 && <Card className="p-6 text-muted-foreground">No bookings yet.</Card>}
        {bookings.map((b) => (
          <Card key={b.id} className="space-y-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{b.service?.name}</p>
                <p className="text-sm text-muted-foreground">{dateFmt.format(new Date(b.starts_at))}</p>
              </div>
              <BookingStatusSelect id={b.id} value={b.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {b.customer_name} · <a className="underline" href={`tel:${b.customer_phone}`}>{b.customer_phone}</a>
              {b.customer_email && <> · {b.customer_email}</>}
            </p>
            {b.notes && <p className="text-sm">“{b.notes}”</p>}
          </Card>
        ))}
      </div>
    </>
  )
}
