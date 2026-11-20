import { Mail, Phone } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getAdminMessages } from "@/lib/data/admin"

export const metadata = { title: "Messages" }
const dateFmt = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })

export default async function AdminMessages() {
  const messages = await getAdminMessages()
  return (
    <>
      <h1 className="mb-6 text-3xl font-semibold">Messages</h1>
      <div className="space-y-4">
        {messages.length === 0 && <Card className="p-6 text-muted-foreground">No messages yet.</Card>}
        {messages.map((m) => (
          <Card key={m.id} className="space-y-2 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{dateFmt.format(new Date(m.created_at))}</p>
            </div>
            <p className="whitespace-pre-wrap text-sm">{m.message}</p>
            <p className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a className="flex items-center gap-1 underline" href={`mailto:${m.email}`}><Mail className="size-3.5" /> {m.email}</a>
              {m.phone && <a className="flex items-center gap-1 underline" href={`tel:${m.phone}`}><Phone className="size-3.5" /> {m.phone}</a>}
            </p>
          </Card>
        ))}
      </div>
    </>
  )
}
