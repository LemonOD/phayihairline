import "server-only"
import { formatNaira, siteConfig } from "@/lib/utils"

/**
 * Email notifications via Resend's HTTP API (no SDK needed).
 * No-ops unless RESEND_API_KEY is set, so local dev and previews stay quiet.
 * Failures are logged, never thrown: a notification must not break an order.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

type Mail = { to: string | string[]; subject: string; lines: string[] }

async function send({ to, subject, lines }: Mail) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">${lines
    .map((l) => `<p style="margin:0 0 8px">${escapeHtml(l)}</p>`)
    .join("")}</div>`
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`,
        to,
        subject,
        html,
      }),
    })
    if (!res.ok) console.error("[notify] Resend responded", res.status, await res.text())
  } catch (err) {
    console.error("[notify] failed", err)
  }
}

const admin = () => process.env.ADMIN_NOTIFY_EMAIL

export const notifyNewOrder = (o: { reference: string; name: string; phone: string; total: number }) =>
  admin() ? send({
    to: admin()!,
    subject: `New order ${o.reference} · ${formatNaira(o.total)}`,
    lines: [`${o.name} (${o.phone}) placed order ${o.reference}.`, `Total: ${formatNaira(o.total)}`, `${siteConfig.url}/admin/orders`],
  }) : Promise.resolve()

export const notifyNewBooking = (b: { service: string; when: string; name: string; phone: string }) =>
  admin() ? send({
    to: admin()!,
    subject: `New booking: ${b.service}`,
    lines: [`${b.name} (${b.phone}) booked ${b.service} for ${b.when}.`, `${siteConfig.url}/admin/bookings`],
  }) : Promise.resolve()

export const notifyNewMessage = (m: { name: string; email: string; message: string }) =>
  admin() ? send({
    to: admin()!,
    subject: `New message from ${m.name}`,
    lines: [m.message, `Reply to: ${m.email}`, `${siteConfig.url}/admin/messages`],
  }) : Promise.resolve()

export const emailBookingStatus = (b: { email: string; name: string; service: string; when: string; status: "pending" | "confirmed" | "cancelled" }) => {
  const copy: Record<typeof b.status, [string, string]> = {
    pending: ["We got your booking", `Thanks ${b.name}! We've received your request for ${b.service} on ${b.when} and will confirm shortly.`],
    confirmed: ["Your booking is confirmed", `Hi ${b.name}, your ${b.service} appointment on ${b.when} is confirmed. See you at ${siteConfig.address}.`],
    cancelled: ["Your booking was cancelled", `Hi ${b.name}, your ${b.service} appointment on ${b.when} has been cancelled. Contact us on ${siteConfig.phone} to rebook.`],
  }
  const [title, body] = copy[b.status]
  return send({ to: b.email, subject: `${title} · ${siteConfig.name}`, lines: [body] })
}

export const notifyNewReview = (r: { product: string; rating: number; body: string }) =>
  admin() ? send({
    to: admin()!,
    subject: `New ${r.rating}★ review for ${r.product}`,
    lines: [r.body, `Moderate: ${siteConfig.url}/admin/reviews`],
  }) : Promise.resolve()
