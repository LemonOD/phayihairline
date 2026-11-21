# PhayiHairline

Storefront for a Lagos wig studio: wigs, frontals and tools, plus bookable installation services.
Checkout creates an order in Supabase, then hands the customer to WhatsApp to confirm payment and delivery.

**Stack:** Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 ·
Supabase (Auth, Postgres + RLS, Storage) · Framer Motion · Zustand · React Hook Form + Zod

## Setup

1. Create a Supabase project, then run the files in `supabase/migrations/` in order (0001 → 0007), then
   `supabase/seed.sql` and optionally `supabase/seed_variants.sql`, in the SQL editor (or `supabase db push`).
2. `cp .env.example .env.local` and fill in the project URL and the **publishable** key (`sb_publishable_…`).
   Never put a secret/service-role key in a `NEXT_PUBLIC_` variable.
   Optional: set `RESEND_API_KEY` + `ADMIN_NOTIFY_EMAIL` for email alerts on new orders, bookings and messages.
3. In Supabase → Authentication → URL Configuration, add `http://localhost:3000/auth/callback`
   (and your production URL) as a redirect URL.
4. `npm install && npm run dev`
5. Sign up on the site, then promote yourself to admin:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

## Structure

```
src/app            routes (shop, services, book, checkout, account, admin, auth)
src/components     ui/ primitives · layout/ · shop/ · home/ · booking/ · auth/ · admin/
src/lib/actions    server actions (auth, orders, bookings, contact, admin)
src/lib/data       server-side reads (catalog, services, session, slots, admin)
src/lib/supabase   browser / server / middleware clients
src/stores         cart + wishlist (Zustand, persisted)
supabase/          schema, RLS policies, seed data
```

## Design notes

- **Security lives in the database.** Admin is a `profiles.role`, enforced by RLS and re-checked in
  every admin server action. Order totals are recomputed inside `place_order()`, so clients can't set prices.
  Double bookings are prevented by a partial unique index on `bookings.starts_at`.
- Catalog filters/sort/search live in the URL and are rendered on the server.
- Every file is under 250 lines (enforced by ESLint `max-lines`).

## Testing

| Command | What it covers |
| --- | --- |
| `npm test` | Vitest unit tests: Zod schemas, slot logic, cart store, WhatsApp message, utils |
| `npm run e2e` | Playwright (desktop + mobile): browse → variant → cart → checkout, keyboard-only walkthrough, axe accessibility scans, robots/sitemap |
| `E2E_ALLOW_ORDERS=1 npm run e2e` | Also places a **real** order. Point it at a staging Supabase project only |
| `npm run check` | lint + typecheck + unit tests + build (what CI runs) |

First run: `npx playwright install chromium`. E2E reads your catalog from Supabase (read-only by default).
CI (`.github/workflows/ci.yml`) always runs lint, types, unit tests and build; set the repo variable
`E2E_ENABLED=true` (plus the Supabase secrets) to run the browser tests too.

## Before you launch

- Confirm opening hours in `siteConfig.hours` (`src/lib/utils.ts`). They feed the contact page, booking slots and Google structured data.
- Production domain is `https://phayihairline.org`: set `NEXT_PUBLIC_SITE_URL` to it in Vercel, add it plus `https://phayihairline.org/auth/callback` in Supabase → Authentication → URL Configuration, and verify the domain in Resend so `NOTIFY_FROM` can use it.
- Claim your Google Business Profile and keep name, address and phone identical to the site.
- Analytics: `@vercel/analytics` renders only when hosted on Vercel; custom funnel events need a plan that supports them.

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run e2e`
