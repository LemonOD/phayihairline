/**
 * Typed shape of the Supabase `public` schema, written from `supabase/migrations/0001-0006`.
 *
 * Passing this to `createServerClient<Database>()` makes every `.from("…")`, `.select("…")` and `.rpc("…")`
 * type-checked, which removes the `as Product[]` casts that used to hide schema drift.
 *
 * Keep it in sync with the migrations. Once the Supabase CLI is set up, it can replace this file:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel<Cols extends string, Ref extends string, Name extends string> = {
  foreignKeyName: Name
  columns: [Cols]
  isOneToOne: false
  referencedRelation: Ref
  referencedColumns: ["id"]
}

type Table<Row, Relationships extends unknown[] = []> = {
  Row: Row
  /** Loose on purpose: Postgres enforces NOT NULL and defaults; the app validates input with zod first. */
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: Relationships
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string
        full_name: string | null
        phone: string | null
        role: "customer" | "admin"
        created_at: string
      }>
      categories: Table<{
        slug: string
        name: string
        description: string
        image_url: string | null
        sort_order: number
      }>
      products: Table<
        {
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
          created_at: string
          updated_at: string
        },
        [Rel<"category", "categories", "products_category_fkey">]
      >
      product_variants: Table<
        {
          id: string
          product_id: string
          options: Record<string, string>
          price: number
          compare_at_price: number | null
          stock: number
          sort_order: number
          created_at: string
        },
        [Rel<"product_id", "products", "product_variants_product_id_fkey">]
      >
      services: Table<{
        id: string
        slug: string
        name: string
        description: string
        /** null = priced on request (depends on the style the client wants) */
        price: number | null
        duration_minutes: number
        features: string[]
        sort_order: number
        is_active: boolean
      }>
      bookings: Table<
        {
          id: string
          service_id: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          starts_at: string
          ends_at: string
          notes: string | null
          status: "pending" | "confirmed" | "completed" | "cancelled"
          created_at: string
        },
        [Rel<"service_id", "services", "bookings_service_id_fkey">]
      >
      orders: Table<{
        id: string
        reference: string
        user_id: string | null
        customer_name: string
        customer_phone: string
        delivery_address: string
        items: Json
        total: number
        status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
        created_at: string
      }>
      contact_messages: Table<{
        id: string
        name: string
        email: string
        phone: string | null
        message: string
        created_at: string
      }>
      reviews: Table<
        {
          id: string
          product_id: string
          user_id: string
          order_id: string
          author_name: string
          rating: number
          title: string | null
          body: string
          status: "published" | "hidden"
          created_at: string
        },
        [Rel<"product_id", "products", "reviews_product_id_fkey">]
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      place_order: {
        Args: { p_name: string; p_phone: string; p_address: string; p_items: Json }
        /** `items` exists from migration 0006; the app falls back when it is missing. */
        Returns: { order_id: string; reference: string; total: number; items?: Json }[]
      }
      submit_review: {
        Args: { p_product_id: string; p_rating: number; p_title: string; p_body: string }
        Returns: string
      }
      taken_slots: {
        Args: { p_from: string; p_to: string }
        Returns: { starts_at: string; ends_at: string }[]
      }
      save_product: {
        Args: { p_id: string | null; p_product: Json; p_variants: Json }
        Returns: string
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
