import { ServiceForm } from "@/components/admin/service-form"

export const metadata = { title: "New service" }

export default function NewService() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">New service</h1>
      <ServiceForm />
    </>
  )
}
