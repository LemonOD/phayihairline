import { notFound } from "next/navigation"
import { ServiceForm } from "@/components/admin/service-form"
import { getAdminService } from "@/lib/data/admin"

export const metadata = { title: "Edit service" }

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const service = await getAdminService((await params).id)
  if (!service) notFound()
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Edit service</h1>
      <ServiceForm service={service} />
    </>
  )
}
