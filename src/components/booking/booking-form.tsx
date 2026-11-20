"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarCheck } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input, Select, Textarea } from "@/components/ui/input"
import { createBooking } from "@/lib/actions/bookings"
import { getAvailableSlots, type Slot } from "@/lib/actions/slots"
import { formatNaira, cn } from "@/lib/utils"
import type { Service } from "@/types"

const schema = z.object({
  serviceId: z.string().min(1, "Choose a service"),
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
})
type Values = z.infer<typeof schema>

const todayLagos = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date())
const timeFmt = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" })

type Props = { services: Service[]; initialSlug?: string; defaults: { name: string; phone: string; email: string } }

export function BookingForm({ services, initialSlug, defaults }: Props) {
  const [date, setDate] = useState(todayLagos())
  const [loaded, setLoaded] = useState<{ key: string; slots: Slot[] } | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()

  const initial = services.find((s) => s.slug === initialSlug)?.id ?? ""
  const { register, handleSubmit, control, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: initial, ...defaults, notes: "" },
  })

  const serviceId = useWatch({ control, name: "serviceId" })
  const service = services.find((s) => s.id === serviceId)

  const key = service ? `${date}|${service.id}` : ""
  const slots = loaded?.key === key ? loaded.slots : null

  useEffect(() => {
    if (!service) return
    let cancelled = false
    getAvailableSlots(date, service.duration_minutes).then((r) => {
      if (!cancelled) setLoaded({ key: `${date}|${service.id}`, slots: r })
    })
    return () => { cancelled = true }
  }, [date, service])

  const onSubmit = (v: Values) => {
    if (!slot) return setError("Please choose a time")
    setError(null)
    start(async () => {
      const res = await createBooking({ ...v, startsAt: slot })
      if (res.ok) return setDone(true)
      setError(res.error)
      if (service) getAvailableSlots(date, service.duration_minutes).then((r) => setLoaded({ key, slots: r }))
    })
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 py-12 text-center">
        <CalendarCheck className="mx-auto size-16 text-emerald-500" />
        <h2 className="text-3xl font-semibold">You&apos;re booked in!</h2>
        <p className="text-muted-foreground">We&apos;ll confirm your appointment shortly by phone or WhatsApp.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service" htmlFor="serviceId" error={errors.serviceId?.message}>
          <Select id="serviceId" {...register("serviceId", { onChange: () => setSlot(null) })}>
            <option value="">Select a service…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {formatNaira(s.price)}</option>)}
          </Select>
        </Field>
        <Field label="Date" htmlFor="date">
          <Input id="date" type="date" min={todayLagos()} value={date} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setSlot(null) } }} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Available times</legend>
        {!service ? <p className="text-sm text-muted-foreground">Choose a service to see times.</p>
          : slots === null ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />)}</div>
          : slots.length === 0 ? <p className="text-sm text-muted-foreground">No times on this day.</p>
          : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map((s) => (
                <motion.button key={s.iso} type="button" whileTap={{ scale: 0.95 }} disabled={!s.available}
                  aria-pressed={slot === s.iso} onClick={() => setSlot(s.iso)}
                  className={cn("h-10 rounded-md border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                    slot === s.iso ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  {timeFmt.format(new Date(s.iso))}
                </motion.button>
              ))}
            </div>
          )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={errors.name?.message}><Input id="name" autoComplete="name" {...register("name")} /></Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone?.message}><Input id="phone" type="tel" autoComplete="tel" {...register("phone")} /></Field>
      </div>
      <Field label="Email (optional)" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" {...register("email")} /></Field>
      <Field label="Notes (optional)" htmlFor="notes"><Textarea id="notes" placeholder="Wig style, hair concerns…" {...register("notes")} /></Field>

      <AnimatePresence>
        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="alert" className="text-sm text-destructive">{error}</motion.p>}
      </AnimatePresence>
      <Button type="submit" size="lg" className="w-full" loading={pending}>Confirm booking</Button>
    </form>
  )
}
