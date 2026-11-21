import { BankForm } from "@/components/admin/bank-form"
import { getBankDetails } from "@/lib/data/settings"

export const metadata = { title: "Payment details" }

export default async function PaymentsPage() {
  const current = await getBankDetails()

  return (
    <>
      <h1 className="text-3xl font-semibold">Payment details</h1>
      <p className="mb-6 mt-1 max-w-xl text-sm text-muted-foreground">
        Customers see this account right after they place an order, then continue to WhatsApp once they have paid.
        {current ? " Changes apply to the next order straight away." : " Nothing is set yet, so customers go straight to WhatsApp."}
      </p>
      <BankForm current={current} />
    </>
  )
}
