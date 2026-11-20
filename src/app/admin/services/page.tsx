import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteServiceButton } from "@/components/admin/delete-service-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAdminServices } from "@/lib/data/admin"
import { formatNaira } from "@/lib/utils"

export const metadata = { title: "Services" }

export default async function AdminServices() {
  const services = await getAdminServices()
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Services</h1>
        <Button asChild><Link href="/admin/services/new"><Plus /> New service</Link></Button>
      </div>
      <Card className="divide-y">
        {services.length === 0 && <p className="p-6 text-muted-foreground">No services yet.</p>}
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/services/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
              <p className="text-sm text-muted-foreground">{formatNaira(s.price)} · {s.duration_minutes} min</p>
            </div>
            {!s.is_active && <Badge variant="muted">Hidden</Badge>}
            <DeleteServiceButton id={s.id} name={s.name} />
          </div>
        ))}
      </Card>
    </>
  )
}
