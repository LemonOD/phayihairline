"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/confirm"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { clearBankDetails, saveBankDetails } from "@/lib/actions/settings"
import { bankDetailsSchema, type BankDetails } from "@/lib/validation/schemas"

export function BankForm({ current }: { current: BankDetails | null }) {
  const router = useRouter()
  const confirm = useConfirm()
  const [pending, start] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<BankDetails>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: current ?? { bankName: "", accountName: "", accountNumber: "" },
  })

  const onSubmit = (values: BankDetails) =>
    start(async () => {
      const res = await saveBankDetails(values)
      if (!res.ok) return void toast.error(res.error)
      toast.success("Payment details saved")
      router.refresh()
    })

  const remove = async () => {
    const ok = await confirm({
      title: "Remove payment details?",
      description: "Customers will skip the payment step and go straight to WhatsApp after placing an order.",
      confirmLabel: "Remove details",
    })
    if (!ok) return
    start(async () => {
      const res = await clearBankDetails()
      if (!res.ok) return void toast.error(res.error)
      toast.success("Payment details removed")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5" noValidate>
      <Field label="Bank" htmlFor="bankName" error={errors.bankName?.message} hint="e.g. GTBank, Access Bank, Opay">
        <Input id="bankName" autoComplete="off" {...register("bankName")} />
      </Field>
      <Field label="Account name" htmlFor="accountName" error={errors.accountName?.message} hint="Exactly as it appears on the account">
        <Input id="accountName" autoComplete="off" {...register("accountName")} />
      </Field>
      <Field label="Account number" htmlFor="accountNumber" error={errors.accountNumber?.message} hint="10 digits">
        <Input id="accountNumber" inputMode="numeric" autoComplete="off" maxLength={13} {...register("accountNumber")} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending}>Save details</Button>
        {current && <Button type="button" variant="ghost" disabled={pending} onClick={remove}>Remove details</Button>}
      </div>
    </form>
  )
}
