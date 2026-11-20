-- PhayiHairline schema. Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ───────────── Profiles & roles ─────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── Catalog ─────────────
create table public.categories (
  slug text primary key,
  name text not null,
  description text not null default '',
  image_url text,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  category text not null references public.categories(slug) on update cascade,
  images text[] not null default '{}',
  features text[] not null default '{}',
  tags text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category) where is_active;
create index products_featured_idx on public.products (is_featured) where is_active;

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ───────────── Services & bookings ─────────────
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  features text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  starts_at timestamptz not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);
-- One active booking per slot: prevents double booking at the database level.
create unique index bookings_active_slot_idx on public.bookings (starts_at)
  where status in ('pending', 'confirmed');

-- ───────────── Orders (placed, then completed over WhatsApp) ─────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  items jsonb not null,
  total integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ───────────── Functions (security definer = tamper-proof) ─────────────
-- Prices are recomputed server-side from the products table; clients never set totals.
create function public.place_order(
  p_name text, p_phone text, p_address text, p_items jsonb
) returns table (order_id uuid, reference text, total integer)
language plpgsql security definer set search_path = public as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_ref text := 'PH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_row record;
  v_id uuid;
begin
  for v_row in
    select p.id, p.name, p.price, p.images[1] as image, greatest((i->>'quantity')::int, 1) as qty
    from jsonb_array_elements(p_items) i
    join public.products p on p.id = (i->>'product_id')::uuid and p.is_active
  loop
    v_items := v_items || jsonb_build_object(
      'product_id', v_row.id, 'name', v_row.name, 'price', v_row.price,
      'quantity', v_row.qty, 'image', v_row.image);
    v_total := v_total + v_row.price * v_row.qty;
  end loop;

  if jsonb_array_length(v_items) = 0 then raise exception 'Cart is empty'; end if;

  insert into public.orders (reference, user_id, customer_name, customer_phone, delivery_address, items, total)
  values (v_ref, auth.uid(), p_name, p_phone, p_address, v_items, v_total)
  returning id into v_id;

  return query select v_id, v_ref, v_total;
end $$;

-- Lets anonymous visitors see which slots are taken without exposing booking data.
create function public.taken_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql stable security definer set search_path = public as $$
  select starts_at from public.bookings
  where status in ('pending', 'confirmed') and starts_at >= p_from and starts_at < p_to;
$$;

grant execute on function public.place_order to anon, authenticated;
grant execute on function public.taken_slots to anon, authenticated;

-- ───────────── Row level security ─────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.orders enable row level security;
alter table public.contact_messages enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "public read categories" on public.categories for select using (true);
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "public read active products" on public.products for select using (is_active or public.is_admin());
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "public read active services" on public.services for select using (is_active or public.is_admin());
create policy "admin write services" on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy "anyone can book" on public.bookings for insert
  with check (status = 'pending' and (user_id is null or user_id = auth.uid()));
create policy "read own bookings" on public.bookings for select using (user_id = auth.uid() or public.is_admin());
create policy "admin update bookings" on public.bookings for update using (public.is_admin());

create policy "read own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admin update orders" on public.orders for update using (public.is_admin());

create policy "anyone can message" on public.contact_messages for insert with check (true);
create policy "admin read messages" on public.contact_messages for select using (public.is_admin());

-- ───────────── Storage ─────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete product images" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- To make yourself an admin after signing up:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
