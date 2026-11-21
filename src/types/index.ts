import type { Database } from "./database"

type Tables = Database["public"]["Tables"]

// Row types come straight from the database types, so the app and the schema cannot drift apart.
export type Role = Tables["profiles"]["Row"]["role"]
export type Category = Tables["categories"]["Row"]
export type ProductVariant = Tables["product_variants"]["Row"]
export type Product = Tables["products"]["Row"] & { variants?: ProductVariant[] }
export type Review = Tables["reviews"]["Row"]
export type Service = Tables["services"]["Row"]
export type BookingStatus = Tables["bookings"]["Row"]["status"]
export type OrderStatus = Tables["orders"]["Row"]["status"]
export type Booking = Tables["bookings"]["Row"] & {
  service?: Pick<Service, "name" | "duration_minutes" | "price"> | null
}

/** One line of a placed order, as stored (and priced) by `place_order()`. */
export type OrderItem = {
  product_id: string
  variant_id?: string | null
  variant?: string | null
  name: string
  price: number
  quantity: number
  image: string | null
}

/** `orders.items` is JSON in Postgres; the data layer validates it into `OrderItem[]`. */
export type Order = Omit<Tables["orders"]["Row"], "items"> & { items: OrderItem[] }

/** The few fields the cart and wishlist need, so server components can hand client buttons a small object. */
export type ProductSummary = Pick<
  Product, "id" | "slug" | "name" | "price" | "category" | "stock" | "images" | "option_names"
>

export type Profile = Pick<Tables["profiles"]["Row"], "id" | "full_name" | "phone" | "role">

export type ActionFailure = { ok: false; error: string; fieldErrors?: Record<string, string[]> }

/**
 * `ActionResult` (no argument) is a success with no payload. `ActionResult<Data>` is a success that always
 * carries `data`, so callers never have to null-check or cast it.
 */
export type ActionResult<T = void> = ([T] extends [void] ? { ok: true } : { ok: true; data: T }) | ActionFailure
