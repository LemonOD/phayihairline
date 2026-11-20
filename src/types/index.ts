export type Role = "customer" | "admin"

export type Category = {
  slug: string
  name: string
  description: string
  image_url: string | null
  sort_order: number
}

export type ProductVariant = {
  id: string
  product_id: string
  options: Record<string, string>
  price: number
  compare_at_price: number | null
  stock: number
  sort_order: number
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compare_at_price: number | null
  category: string
  images: string[]
  features: string[]
  tags: string[]
  stock: number
  rating: number
  review_count: number
  is_featured: boolean
  is_active: boolean
  option_names: string[]
  variants?: ProductVariant[]
  created_at: string
}

export type Review = {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string | null
  body: string
  status: "published" | "hidden"
  created_at: string
}

export type Service = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  duration_minutes: number
  features: string[]
  sort_order: number
  is_active: boolean
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled"
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export type Booking = {
  id: string
  service_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  starts_at: string
  notes: string | null
  status: BookingStatus
  created_at: string
  service?: Pick<Service, "name" | "duration_minutes" | "price"> | null
}

export type OrderItem = {
  product_id: string
  variant_id?: string | null
  variant?: string | null
  name: string
  price: number
  quantity: number
  image: string | null
}

export type Order = {
  id: string
  reference: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
