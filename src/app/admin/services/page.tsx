import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteServiceButton } from "@/components/admin/delete-service-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAdminServices } from "@/lib/data/admin"
import { formatServicePrice } from "@/lib/utils"

export const metadata = { title: "Services" }

export default async function AdminServices() {
  const services = await getAdminServices()
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Services</h1>
        <Button asChild><Link href="/admin/services/new"><Plus /> New service</Link></Button>
      </div>
      <Card className="divide-y">
        {services.length === 0 && <p className="p-6 text-muted-foreground">No services yet.</p>}
        {services.map((s) => (
          <div key={s.id} className="relative flex items-center gap-3 p-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/services/${s.id}`} className="font-medium leading-snug after:absolute after:inset-0 hover:underline">{s.name}</Link>
              <p className="mt-0.5 text-sm text-muted-foreground">{formatServicePrice(s.price)} · {s.duration_minutes} min</p>
              {!s.is_active && <div className="mt-1.5"><Badge variant="muted">Hidden</Badge></div>}
            </div>
            <div className="relative z-10 -mr-1 sm:mr-0"><DeleteServiceButton id={s.id} name={s.name} /></div>
          </div>
        ))}
      </Card>
    </>
  )
}
