import { z } from "zod"

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number")

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: phoneSchema.optional().or(z.literal("")),
  password: z.string().min(8, "Use at least 8 characters"),
})

export const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email") })

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] })

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: phoneSchema,
  address: z.string().trim().min(8, "Enter your delivery address"),
  items: z
    .array(z.object({
        product_id: z.string().uuid(),
        variant_id: z.string().uuid().nullish(),
        quantity: z.number().int().min(1).max(20),
      }))
    .min(1, "Your cart is empty"),
})

/** The fields a customer types on the checkout page; the server adds the cart lines. */
export const checkoutFormSchema = checkoutSchema.omit({ items: true })

export const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  name: z.string().trim().min(2, "Enter your name"),
  phone: phoneSchema,
  email: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
})

/** The booking form picks the time separately, and its service is a select (empty until chosen), not a uuid yet. */
export const bookingFormSchema = bookingSchema
  .omit({ startsAt: true, serviceId: true })
  .extend({ serviceId: z.string().min(1, "Choose a service") })

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: phoneSchema.optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
})

export const variantSchema = z.object({
  id: z.string().uuid().optional(),
  options: z.record(z.string(), z.string().trim().min(1)),
  price: z.coerce.number().int().min(0),
  compare_at_price: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
})

/** Uploaded images are absolute https URLs (Supabase Storage); bundled brand photos are site-relative paths. */
export const imageRefSchema = z.string().refine(
  (s) => (s.startsWith("/") && !s.startsWith("//")) || s.startsWith("https://"),
  "Invalid image path",
)

export const productSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().default(""),
  price: z.coerce.number().int().min(0),
  compare_at_price: z.coerce.number().int().min(0).nullable().optional(),
  category: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(imageRefSchema).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  option_names: z.array(z.string().trim().min(1)).max(3).default([]),
  variants: z.array(variantSchema).default([]),
})
.superRefine((p, ctx) => {
  const keys = new Set<string>()
  p.variants.forEach((v, i) => {
    const missing = p.option_names.some((n) => !v.options[n])
    const key = p.option_names.map((n) => v.options[n]).join("|")
    if (missing) ctx.addIssue({ code: "custom", message: `Variant ${i + 1} is missing an option value`, path: ["variants", i] })
    else if (keys.has(key)) ctx.addIssue({ code: "custom", message: `Duplicate variant: ${key}`, path: ["variants", i] })
    keys.add(key)
  })
  if (p.variants.length > 0 && p.option_names.length === 0)
    ctx.addIssue({ code: "custom", message: "Name your options (e.g. Length) before adding variants", path: ["option_names"] })
})

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(2000),
})

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Enter a name"),
  description: z.string().trim().default(""),
  price: z.coerce.number().int().min(0),
  duration_minutes: z.coerce.number().int().min(15).max(600),
  features: z.array(z.string()).default([]),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof productSchema>
