import "server-only"
import { formatNaira, siteConfig } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

/**
 * Email notifications via Resend's HTTP API (no SDK needed).
 * No-ops unless RESEND_API_KEY is set, so local dev and previews stay quiet.
 * Failures are logged, never thrown: a notification must not break an order.
 */
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

type Mail = { to: string | string[]; subject: string; lines: string[]; cta?: { label: string; url: string } }

async function send({ to, subject, lines, cta }: Mail) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:520px">${lines
    .map((l) => `<p style="margin:0 0 8px">${escapeHtml(l)}</p>`)
    .join("")}${
    cta ? `<p style="margin:20px 0"><a href="${escapeHtml(cta.url)}" style="background:#2b1d1a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(cta.label)}</a></p>` : ""
  }</div>`
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
    confirmed: ["Your booking is confirmed", `Hi ${b.name}, your ${b.service} appointment on ${b.when} is confirmed. We'll be in touch on WhatsApp with the details.`],
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

/** Sent once, right after a customer confirms their email (or signs up with confirmation switched off). */
export const emailWelcome = (u: { email: string; name?: string | null }) =>
  send({
    to: u.email,
    subject: `Welcome to ${siteConfig.name} 🖤`,
    lines: [
      `Hi ${u.name?.trim() || "there"}, welcome to ${siteConfig.name}! ${siteConfig.tagline}`,
      "Here is what your account gives you: faster checkout with saved details, order tracking, a wishlist, and the chance to review pieces you have bought.",
      "We offer luxury wigs, bundles, closures and frontals, custom units made to order, and revamping. We ship worldwide, including the US and UK.",
      `Questions about an order or a custom unit? WhatsApp us on ${siteConfig.phone}, or reply to this email.`,
    ],
    cta: { label: "Start shopping", url: `${siteConfig.url}/products/wigs` },
  })

/** The order summary plus where to pay, so the customer keeps the details after closing the checkout page. */
export const emailOrderReceived = (o: {
  to: string
  name: string
  reference: string
  total: number
  address: string
  items: { name: string; price: number; quantity: number; variantLabel?: string | null }[]
  bank: { bankName: string; accountName: string; accountNumber: string } | null
}) => {
  const items = o.items.map((i) =>
    `• ${i.quantity} × ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} — ${formatNaira(i.price * i.quantity)}`)
  const payment = o.bank
    ? [
        `To pay, transfer ${formatNaira(o.total)} to:`,
        `Bank: ${o.bank.bankName}`,
        `Account name: ${o.bank.accountName}`,
        `Account number: ${o.bank.accountNumber}`,
        `Please use ${o.reference} as the transfer description, then send your receipt to us on WhatsApp so we can confirm your order.`,
      ]
    : ["We'll confirm payment and delivery with you on WhatsApp."]

  return send({
    to: o.to,
    subject: `Your order ${o.reference} · ${siteConfig.name}`,
    lines: [
      `Hi ${o.name}, thanks for your order!`,
      `Order ${o.reference}`,
      ...items,
      `Total: ${formatNaira(o.total)}`,
      `Delivery to: ${o.address}`,
      ...payment,
    ],
    cta: {
      label: "Send receipt on WhatsApp",
      url: whatsappLink(`Hello ${siteConfig.name}! I've just paid for my order ${o.reference}. I'll send my receipt here.`),
    },
  })
}
