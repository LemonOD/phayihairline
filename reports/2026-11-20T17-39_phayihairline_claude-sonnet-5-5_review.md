# Code Review: phayihairline

- **Model Name:** claude-sonnet-5-5
- **Git Branch:** supabase-rewrite
- **Scope:** all of `src/` (about 5,100 lines, 37 client components), `supabase/migrations`, CI workflow
- **Stack:** Next 16.4.6 (App Router, Turbopack), React 19.3.1, Supabase (`@supabase/ssr`), Zustand, react-hook-form + zod 4, Framer Motion, Tailwind 4
- **Method:** full read of actions, data layer, stores, hooks and every interactive component. Four suspected bugs were reproduced before being reported (marked **Verified**). `tsc`, ESLint and the 39 unit tests already pass. Nothing was changed in the code as part of this review.

> The rubric mentions TanStack Query. This project does not use it and doesn't need to: it is RSC-first with server actions. Section 4 below is therefore assessed against the data layer and the three client-side fetches that exist (booking slots, review eligibility, auth profile).

> **Status update (same day):** C1, C2, C3 and W1 are fixed on this branch (not yet committed). 52 unit tests pass, lint and typecheck are clean, and the production build succeeds with a placeholder Supabase project. C2 needs `supabase/migrations/0005_booking_overlap.sql` applied to the database **before** the new code is deployed. W2-W26 and S1-S2 are still open.

---

## 1. Executive Summary

| Category | Score |
|---|---|
| React 19 practices | 80 |
| Component composition and architecture | 78 |
| TypeScript quality | 72 |
| Data fetching and state | 66 |
| Performance | 64 |
| Accessibility | 72 |
| Styling and class management | 92 |
| Testing readiness | 60 |
| **Overall Quality Score** | **73 / 100** |

**Merge Readiness: Blocked** for production, until the 3 Critical findings are fixed. Each is a small change. Merging into the long-lived rewrite branch is fine.

**What is already good (keep it):**
- Prices and stock are recomputed in Postgres (`place_order` RPC). The client cannot tamper with totals.
- All server actions validate with zod and return a typed `ActionResult`. Notifications use `after()` so they never block or break the order.
- RLS is enabled and the reviews and orders policies are tight.
- `strict` plus `noUncheckedIndexedAccess` is on, and there are no `any` casts anywhere.
- `cn()` (clsx + tailwind-merge) is used consistently. There are no ordering-conflict class strings.
- Public catalog reads use a cookie-free client, so pages can be cached.
- Keyboard and skip-link basics are in place, with an axe e2e suite.
- The Zustand stores skip SSR hydration deliberately and use `useSyncExternalStore` for `useMounted`, which is the right call.

---

## 2. Prioritized Findings

### Critical

#### C1. Admin cannot save any product that uses a local image path
- **Severity**: Critical
- **Category**: TypeScript / Architecture
- **Location**: `src/lib/validation/schemas.ts:75`
- **Issue**: `images: z.array(z.string().url())` rejects relative paths such as `/brand/product-curly-revamp.jpg`. **Verified**: `z.string().url().safeParse("/brand/x.jpg").success === false`. Any product that has the `/brand/...` photos (set by `supabase/seed_brand.sql`) fails with "Invalid URL" the moment the owner opens it in `/admin` and clicks Save, for example to set a price. This was introduced by my earlier seed file.
- **Problematic Code**:
  ```ts
  images: z.array(z.string().url()).default([]),
  ```
- **Recommended Fix**:
  ```ts
  const imageRef = z.string().refine(
    (s) => (s.startsWith("/") && !s.startsWith("//")) || s.startsWith("https://"),
    "Invalid image path",
  )
  // ...
  images: z.array(imageRef).default([]),
  ```
- **Impact**: Blocks the owner's main admin workflow. Also tightens validation (`z.string().url()` accepts `javascript:` and `ftp:` schemes).

#### C2. The booking system can double-book overlapping appointments
- **Severity**: Critical
- **Category**: Architecture / Correctness
- **Location**: `src/lib/actions/bookings.ts:21-24`, `src/lib/data/slots.ts:15-18`, `supabase/migrations/0001_init.sql:93,154-157`
- **Issue**: Availability is keyed only on the exact start time. A 150-minute service booked at 09:00 marks only the 09:00 slot as taken, so another customer can book 10:00 or 11:00 through the normal UI. The unique index is `(starts_at)` and `taken_slots` returns only `starts_at`. The server also never checks that `startsAt` is on the hour (a crafted request for 10:30 passes) or that the service ends before closing time (`close = 18`).
- **Problematic Code**:
  ```ts
  const watHour = (start.getUTCHours() + 1) % 24
  if (start.getTime() < Date.now() || watHour < SHOP_HOURS.open || watHour >= SHOP_HOURS.close) {
  ```
  ```sql
  create unique index bookings_active_slot_idx on public.bookings (starts_at) ...
  ```
- **Recommended Fix**: store an end time and let Postgres enforce non-overlap.
  ```sql
  create extension if not exists btree_gist;
  alter table public.bookings add column ends_at timestamptz;
  alter table public.bookings add constraint bookings_no_overlap
    exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('pending','confirmed'));
  -- taken_slots should return (starts_at, ends_at) so buildSlots can block every covered hour
  ```
  ```ts
  const start = new Date(startsAt)
  const hours = Math.ceil(service.duration_minutes / 60)
  const wat = new Date(start.getTime() + 60 * 60_000) // WAT = UTC+1, no DST
  const startHour = wat.getUTCHours()
  if (wat.getUTCMinutes() !== 0 || startHour < SHOP_HOURS.open || startHour + hours > SHOP_HOURS.close)
    return fail("Please choose a time within opening hours")
  ```
- **Impact**: Prevents two customers being promised the same stylist and time. The exclusion constraint makes it race-proof.

#### C3. The public data layer hides database errors, and there are no error boundaries
- **Severity**: Critical
- **Category**: Architecture / React
- **Location**: `src/lib/data/catalog.ts:14-18,36-37,47-48,59-61`, `src/lib/data/reviews.ts:4-13`, `src/lib/data/admin.ts` (all getters); `src/app` has no `error.tsx`, `global-error.tsx`, `loading.tsx` or custom `not-found.tsx` (confirmed by search)
- **Issue**: Every getter does `const { data } = await ...; return data ?? []`. A Supabase outage or a bad key looks like an empty shop, and `getProductBySlug` returns `null`, which becomes `notFound()`. The product page has `revalidate = 60`, so a transient failure can be cached as an empty or 404 page. Admin pages show "no products" instead of an error. There is also no branded error or 404 page.
- **Problematic Code**:
  ```ts
  const { data } = await req
  return (data as Product[]) ?? []
  ```
- **Recommended Fix**:
  ```ts
  const { data, error } = await req
  if (error) throw error            // ISR keeps serving the last good page
  return data ?? []
  ```
  Add `src/app/error.tsx`, `src/app/global-error.tsx` (client components with a retry button) and `src/app/not-found.tsx`.
- **Impact**: With a throw, Next keeps the previously generated page when regeneration fails. With the current code it caches the empty state. It also makes outages visible in logs.

---

### Warning

#### W1. An invalid date in the slots action throws an unhandled error
- **Severity**: Warning · **Category**: TypeScript / Correctness
- **Location**: `src/lib/actions/slots.ts:6`, `src/lib/data/slots.ts:7-8`
- **Issue**: **Verified.** The regex `^\d{4}-\d{2}-\d{2}$` accepts `2026-13-45`. `new Date("2026-13-45T00:00:00+01:00").toISOString()` throws `RangeError: Invalid time value`, so the action returns a server error.
- **Problematic Code**: `date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`
- **Recommended Fix**: `date: z.iso.date()` (zod 4 validates real calendar dates).
- **Impact**: Removes a trivially triggerable 500 on a public action.

#### W2. Page content is rendered invisible on the server (hurts LCP, hidden without JS)
- **Severity**: Warning · **Category**: Performance
- **Location**: `src/components/ui/motion.tsx:9-12,39-43`; used by `PageTransition` in 6 pages and by `Reveal`, `Stagger` and `ProductGrid`
- **Issue**: **Verified.** `curl /about` returns `style="opacity:0;transform:translateY(8px)"` in the server HTML. Content only appears after hydration, and with JS blocked it never does. The hero comment in `hero.tsx` already says the `.rise` CSS animation was chosen for exactly this reason. `PageTransition` re-introduces the problem on every page.
- **Problematic Code**:
  ```tsx
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} ...>
  ```
- **Recommended Fix**: make `PageTransition` a Server Component using the existing CSS class.
  ```tsx
  export const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <div className="rise">{children}</div>
  )
  ```
  For `Reveal`/`Stagger`, use `initial={false}` on the server render path, or CSS scroll-driven animation (`animation-timeline: view()`) with a `@supports` fallback.
- **Impact**: Better LCP and no flash of empty content. Removes `"use client"` from 6 page shells.

#### W3. Every product card ships to the client
- **Severity**: Warning · **Category**: Performance / Architecture
- **Location**: `src/components/shop/product-card.tsx:1,48`; `product-grid.tsx`
- **Issue**: `ProductCard` is a client component because of the add-to-cart button, the wishlist button and a hover animation. A 12-product page hydrates 12 motion articles. `WishlistButton` also lives in this file and is imported by `product-purchase.tsx`, which couples unrelated components.
- **Recommended Fix**: render the card as a Server Component, replace `whileHover` with `hover:-translate-y-1 transition`, and keep only `AddToCartButton` and `WishlistButton` as small client islands in their own files.
- **Impact**: Less client JS and fewer hydrated nodes on the main listing pages.

#### W4. Cart, wishlist and Framer Motion load on every route
- **Severity**: Warning · **Category**: Performance
- **Location**: `src/components/layout/providers.tsx:8-9,17-19`
- **Issue**: `CartDrawer` and `WishlistDrawer` (with Radix Dialog and Framer Motion) are imported eagerly into the root layout, although they are closed on first paint.
- **Recommended Fix**:
  ```tsx
  const CartDrawer = dynamic(() => import("@/components/shop/cart-drawer").then(m => m.CartDrawer))
  ```
  Mount it only once `useCart(s => s.open)` has been true. Consider `LazyMotion` with `m.*` components to cut the Framer Motion bundle.
- **Impact**: Smaller initial JS on every page.

#### W5. Analytics side effect inside a Zustand `set` updater
- **Severity**: Warning · **Category**: React
- **Location**: `src/stores/cart.ts:44`
- **Issue**: `track("add_to_cart", ...)` runs inside `set((s) => ...)`. Updater functions must be pure. Under React Strict Mode or any re-run, the event fires twice.
- **Recommended Fix**: call `track` in `add` before `set`, using `get()` for the data, not inside the updater.
- **Impact**: Accurate funnel numbers.

#### W6. Components subscribe to the whole cart store
- **Severity**: Warning · **Category**: Performance
- **Location**: `src/components/shop/cart-drawer.tsx:13`, `src/components/shop/checkout-form.tsx:35`
- **Issue**: `const { lines, open, setOpen, ... } = useCart()` re-renders the component on any state change, including the `open` flag.
- **Recommended Fix**: select fields, with `useShallow` for the multi-field case.
  ```tsx
  const lines = useCart((s) => s.lines)
  const setQuantity = useCart((s) => s.setQuantity)
  ```
- **Impact**: Fewer needless renders, especially in the checkout form (it re-renders react-hook-form on every cart toggle).

#### W7. Review deletion trusts only RLS, and "0 rows affected" is reported as success
- **Severity**: Warning · **Category**: Architecture / Security
- **Location**: `src/lib/actions/reviews.ts:42-47`, `src/lib/actions/admin.ts:84-91,135-143`
- **Issue**: `deleteReview` has no `requireAdmin()` unlike every other admin action. RLS saves it (users can only delete their own, admins any), so this is not an open hole. But the action is called from the admin UI, and none of the update/delete actions check whether a row was actually changed, so `ok: true` is returned for a no-op (for example a stale ID).
- **Recommended Fix**:
  ```ts
  const { data, error } = await supabase.from("reviews").delete().eq("id", id).select("id")
  if (error) return fail(error.message)
  if (!data?.length) return fail("Review not found")
  ```
  Add `await requireAdmin()` if the action is admin-only.
- **Impact**: Defense in depth and honest UI feedback.

#### W8. `saveProduct` is not atomic and relies on non-null assertions
- **Severity**: Warning · **Category**: Architecture / TypeScript
- **Location**: `src/lib/actions/admin.ts:57-72`
- **Issue**: The product row is saved, then variants are deleted and upserted in separate calls. A failure leaves a half-saved product, and the code can only tell the admin "Product saved, but variants failed". `productId!` is asserted twice. The slug gets a random 4-character suffix with no uniqueness retry.
- **Recommended Fix**: a `save_product(p_id uuid, p_product jsonb, p_variants jsonb)` Postgres function (one transaction), or at minimum restructure so `productId` is a `const` returned from the branch instead of `let` plus `!`.
- **Impact**: Consistent catalog data.

#### W9. Validation rules are duplicated between client and server
- **Severity**: Warning · **Category**: Architecture
- **Location**: `src/components/shop/checkout-form.tsx:23-28`, `src/components/booking/booking-form.tsx:19-26`, vs `src/lib/validation/schemas.ts:3-6,29-49`
- **Issue**: The Nigerian phone regex and the name/address rules exist in three places and have already drifted (for example `serviceId: z.string().min(1)` on the client vs `.uuid()` on the server).
- **Recommended Fix**: export `phoneSchema` and derive the form schemas.
  ```ts
  export const checkoutFormSchema = checkoutSchema.omit({ items: true })
  type Values = z.infer<typeof checkoutFormSchema>
  ```
- **Impact**: One source of truth. A rule change can no longer be fixed on one side only.

#### W10. Form errors are not linked to their inputs
- **Severity**: Warning · **Category**: Accessibility
- **Location**: `src/components/ui/field.tsx:14-21` (used in all forms)
- **Issue**: The error `<p role="alert">` is announced when it appears, but screen readers never associate it with the field later, and `aria-describedby` is missing. Only checkout sets `aria-invalid`.
- **Recommended Fix**: generate an id with `useId()` and pass it down.
  ```tsx
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  // clone the child with { id: htmlFor, "aria-invalid": !!error, "aria-describedby": describedBy }
  ```
- **Impact**: WCAG 3.3.1 and 1.3.1 compliance for every form at once.

#### W11. Invalid list markup, and review stats that don't add up
- **Severity**: Warning · **Category**: Accessibility / Correctness
- **Location**: `src/components/shop/reviews-section.tsx:42-45,38`
- **Issue**: `<ul>` contains `Reveal` (a `<div>`) which contains the `<li>`. `ul > div > li` is invalid HTML. Also, the rating bars use `reviews.length` (capped at 30 by `getReviews`) as the denominator while the headline shows `product.review_count`, so the numbers disagree once a product has more than 30 reviews.
- **Recommended Fix**: `<Reveal as="li">` or put the `<li>` outside and animate an inner wrapper. Compute the distribution in SQL (or from the full count).
- **Impact**: Valid semantics and correct statistics.

#### W12. Unavailable variants are indicated by styling only
- **Severity**: Warning · **Category**: Accessibility
- **Location**: `src/components/shop/variant-picker.tsx:40-50`
- **Issue**: Out-of-stock options only get `line-through opacity-50`. Screen readers and users who can't see strikethrough get no information.
- **Recommended Fix**: add `aria-disabled={!available && !selected}` and a visually hidden "(unavailable)" suffix.
- **Impact**: WCAG 1.4.1 (use of colour/style alone).

#### W13. The star rating radio group has no keyboard model
- **Severity**: Warning · **Category**: Accessibility
- **Location**: `src/components/shop/review-form.tsx:41-48`
- **Issue**: Buttons with `role="radio"` do not provide arrow-key navigation or roving tabindex, which `role="radio"` promises. Each star is a separate tab stop.
- **Recommended Fix**: use real `<input type="radio" name="rating" class="sr-only">` inside `<label>`s. The browser provides the keyboard behaviour for free.
- **Impact**: Keyboard and screen reader usability; also a smaller component.

#### W14. Image uploader can hang, and its remove button is unreachable on touch
- **Severity**: Warning · **Category**: React / Accessibility
- **Location**: `src/components/admin/image-uploader.tsx:17-35,42-43,28`
- **Issue**: (a) `setUploading(false)` is not in a `finally`, so a thrown network error leaves "Uploading…" and a disabled input forever. (b) The remove button is `opacity-0 group-hover:opacity-100`; on touch devices (the owner may upload from a phone) it can't be reached. (c) The storage path extension comes from the file name unsanitised. (d) Removed images are never deleted from storage.
- **Recommended Fix**: wrap the loop in `try/finally`; use `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`; derive the extension from `file.type`.
- **Impact**: Reliable admin uploads on mobile.

#### W15. No generated Supabase types, so casts are scattered everywhere
- **Severity**: Warning · **Category**: TypeScript
- **Location**: `src/lib/data/catalog.ts`, `src/lib/data/admin.ts:7,18,25,…`, `src/lib/actions/admin.ts:24,104-106` (`as unknown as { name: string }`), `src/lib/data/admin.ts:51` (`table: string`)
- **Issue**: About 15 `as Product[]`-style casts mean a schema change compiles fine and fails at runtime.
- **Recommended Fix**: `supabase gen types typescript > src/types/database.ts`, then `createServerClient<Database>(...)`. Derive `Product` etc. from `Database["public"]["Tables"]`.
- **Impact**: Compile-time safety across the whole data layer. Removes most casts.

#### W16. `ActionResult` makes `data` optional for every success
- **Severity**: Warning · **Category**: TypeScript
- **Location**: `src/types/index.ts:110-112`, `src/components/shop/checkout-form.tsx:84`, `src/hooks/use-action-form.ts:17`
- **Issue**: `{ ok: true; data?: T }` forces `!res.data` checks and a cast (`res.data as T`) even when the action always returns data.
- **Recommended Fix**:
  ```ts
  export type ActionResult<T = void> =
    | (T extends void ? { ok: true } : { ok: true; data: T })
    | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  ```
- **Impact**: Removes casts and the "Something went wrong" dead branch.

#### W17. The WhatsApp order message uses stale client prices
- **Severity**: Warning · **Category**: Architecture / Correctness
- **Location**: `src/components/shop/checkout-form.tsx:88`, `src/lib/whatsapp.ts:16`
- **Issue**: The total comes from the server, but each line price comes from the persisted localStorage cart. If a price changed since the item was added, the message shows lines that don't add up to the total.
- **Recommended Fix**: have `place_order` return the priced line items and build the message from those.
- **Impact**: The owner never receives an order that contradicts itself.

#### W18. Every catalog or review change revalidates the whole site
- **Severity**: Warning · **Category**: Performance
- **Location**: `src/lib/actions/admin.ts:13-15`, `src/lib/actions/reviews.ts:38,46`
- **Issue**: `revalidatePath("/", "layout")` purges every cached page for a single product edit.
- **Recommended Fix**: revalidate targeted paths (`/products/[category]`, the product page, `/`) or use cache tags. Check the current API against `node_modules/next/dist/docs/` first, since this Next version differs from older releases.
- **Impact**: Fewer cache rebuilds and cheaper edits.

#### W19. Product card links and disabled state
- **Severity**: Warning · **Category**: Accessibility
- **Location**: `src/components/shop/product-card.tsx:51,64,74`
- **Issue**: Each card has two links to the same URL (image link with `aria-label` and heading link), so keyboard users tab through duplicates. `<Button asChild disabled>` around a `Link` does not disable an anchor, so a sold-out product's "Options" link stays clickable.
- **Recommended Fix**: one stretched link (`after:absolute after:inset-0` on the heading link) and the image marked decorative. For disabled, render a non-link element.
- **Impact**: Fewer tab stops per card; correct disabled semantics.

#### W20. Header toggle and count badges are not announced
- **Severity**: Warning · **Category**: Accessibility
- **Location**: `src/components/layout/header-client.tsx:48,69-76`
- **Issue**: The mobile menu button has no `aria-expanded` or `aria-controls`, and Escape doesn't close the menu. Cart and wishlist buttons are labelled "Cart" and "Wishlist" but the item count (the badge) is invisible to screen readers.
- **Recommended Fix**: `aria-expanded={menuOpen}`, `aria-controls="mobile-nav"`, an Escape handler, and `aria-label={`Cart, ${n} items`}`.
- **Impact**: WCAG 4.1.2.

#### W21. Product page: duplicate fetch and invalid structured data
- **Severity**: Warning · **Category**: Architecture
- **Location**: `src/app/products/[category]/[slug]/page.tsx:24-36,50-56`
- **Issue**: `generateMetadata` and the page both call `getProductBySlug`. `lowPrice` is not valid inside an `Offer` (it belongs to `AggregateOffer`), and the JSON-LD price ignores variants.
- **Recommended Fix**: wrap `getProductBySlug` in React `cache()`. For variants, emit an `AggregateOffer` with `lowPrice`/`highPrice`/`offerCount`.
- **Impact**: One query per render; valid rich results.

#### W22. Review eligibility errors are shown as "not purchased"
- **Severity**: Warning · **Category**: React
- **Location**: `src/components/shop/review-gate.tsx:35-42`
- **Issue**: If either Supabase query fails, `orders.data` is `null`, and the user sees "Only customers who bought this product can review it", which is misleading.
- **Recommended Fix**: check `error` on both results and render a retry state.
- **Impact**: Truthful UX during partial outages.

#### W23. Client-side fetching patterns are hand-rolled
- **Severity**: Warning · **Category**: React / Data fetching
- **Location**: `src/components/booking/booking-form.tsx:58-65,77`, `src/hooks/use-auth-sync.ts:15-42`
- **Issue**: Slots load from a server action inside `useEffect`. Server actions run one at a time per client, so quick date changes queue behind each other, and they're meant for mutations, not reads. The refresh after a failed booking (line 77) has no cancellation, so a stale response can overwrite a newer one. `useAuthSync` calls `load()` on mount and again from `onAuthStateChange` (which fires `INITIAL_SESSION` immediately), and again on every pathname change.
- **Recommended Fix**: expose slots as a GET route handler and read it with `use()` + Suspense or SWR/TanStack Query (the right place for it in this app). In `useAuthSync`, rely on `onAuthStateChange` alone; the callback already receives the session.
- **Impact**: No races, deduplicated requests, fewer profile fetches.

#### W24. `usePrefill` suppresses the hooks lint rule
- **Severity**: Warning · **Category**: React
- **Location**: `src/hooks/use-prefill.ts:14-17`
- **Issue**: An `eslint-disable` hides a stale-closure risk (`fill`) and subscribes to the whole auth store.
- **Recommended Fix**: pass the profile to react-hook-form through `values`/`resetOptions: { keepDirtyValues: true }`, which does exactly "fill without overwriting what the user typed" with no effect.
- **Impact**: Removes an effect and a lint suppression.

#### W25. Product filters: duplicated markup, layout shift and URL desync
- **Severity**: Warning · **Category**: Architecture / Performance
- **Location**: `src/components/shop/product-filters.tsx:32,69-77,80-89`; `src/app/products/[category]/page.tsx:58`
- **Issue**: The price and sort selects are written twice (desktop and mobile). `<Suspense>` has no fallback, so the filter bar pops in after hydration and shifts the grid. The `search` state is seeded from the URL once and never resynced, so browser Back leaves the box showing the old term.
- **Recommended Fix**: extract `<FilterSelects />`; give Suspense a fixed-height skeleton; key the input on `params.get("q")` or sync it.
- **Impact**: Less code, no CLS, correct back-button behaviour.

#### W26. Variant editor reinvents field arrays
- **Severity**: Warning · **Category**: Architecture
- **Location**: `src/components/admin/variant-editor.tsx:29-35,96`
- **Issue**: The product form already uses react-hook-form, but variants are edited with hand-rolled controlled rows, `key={r.id ?? i}` (index keys break on delete) and duplicated state (`namesText`, `valuesText`).
- **Recommended Fix**: `useFieldArray({ name: "variants" })` with stable ids.
- **Impact**: Less code, correct focus and state on row removal.

---

### Suggestion

#### S1. Test coverage is thin where the logic lives
- **Category**: Testing readiness
- **Location**: `src/lib/__tests__/` (4 files: schemas, slots, utils, whatsapp-cart); CI `e2e` job is off unless `E2E_ENABLED`
- **Issue**: No tests for the cart store (pure, trivial to test), the variant fallback logic in `product-purchase.tsx:36-43`, or any server action. The `select()` fallback is buried in a component.
- **Recommended Fix**: extract `resolveSelection(variants, optionNames, current, option, value)` into `src/lib/variants.ts` and unit test it; add cart store tests (add/merge/clamp to stock/remove); test `createBooking` with a mocked client once C2 lands.
- **Impact**: Protects the revenue path.

#### S2. Small details
- **Category**: React / Accessibility
- `product-gallery.tsx:26` thumbnail buttons miss `type="button"` and `aria-pressed`; `priority` is set on every main image swap (line 19) instead of only the first.
- `cart-drawer.tsx:17` description says `${lines.length} item(s)`; use the item count with proper pluralisation (`cartCount`).
- `review-form.tsx` doesn't use react-hook-form unlike the other forms and doesn't reset after success.
- `product-card.tsx:74` and `variant-picker.tsx:40`: `motion.button` for press feedback on every option is unnecessary; `active:scale-95` in CSS does the same.
- `product-purchase.tsx:49`: `AnimatePresence` keyed on price animates every variant change; consider dropping it for a cheaper CSS transition.

---

## 3. Architecture and Refactoring "Judo Moves"

1. **One schema module, derived everywhere (W9, W16).** Export `phoneSchema` plus `checkoutFormSchema = checkoutSchema.omit({ items: true })`, and have forms, actions and tests import them. Deletes about 20 lines of duplicated rules and ends drift.
2. **Throw in the data layer, catch at the boundary (C3).** One `if (error) throw error` per getter plus three small files (`error.tsx`, `global-error.tsx`, `not-found.tsx`). This turns silent data loss into a handled, loggable state and fixes the ISR caching hazard.
3. **Make motion opt-in on the server (W2, W3, W4).** `PageTransition`, `Reveal` and `ProductCard` hold most of the client JS and the invisible-SSR problem. Replace them with CSS (`.rise` already exists), keep Framer Motion for the drawer and gallery only, and lazy-load it. Expect a noticeably smaller bundle and better LCP with no visual change.
4. **Push multi-step writes into Postgres (C2, W8, W17).** The best fixes for double booking, half-saved products and stale order messages are all the same move: let the database enforce and return the truth (`EXCLUDE` constraint, `save_product()`, `place_order` returning priced lines) and keep TypeScript thin.
5. **Generate types, delete casts (W15).** One `supabase gen types` command removes most `as X[]` casts and the `as unknown as` in `admin.ts`.
6. **Inline derived state.** `useAuthSync` plus a `usePrefill` effect plus a `useHydrateStores` effect are three effects that mirror external state. Prefer `onAuthStateChange` alone, react-hook-form `values`, and a single `persist.rehydrate()` call.

### Suggested order of work
1. C1 (5-minute fix, and unblocks the owner today).
2. C3 (error boundaries and throwing getters).
3. C2 (migration plus server check).
4. W1, W5, W7, W2 (quick wins).
5. W10, W13, W12, W20 (accessibility pass).
6. The performance items (W3, W4, W6, W18) and the testing items (S1).
