-- Product variants: each option combination (e.g. Length 18" + Density 180%) has its own price and stock.
-- products.price / stock / compare_at_price stay as the "from" price and total stock,
-- kept in sync by trigger so listing, sorting and price filters need no changes.

alter table public.products add column if not exists option_names text[] not null default '{}';

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  options jsonb not null,                       -- {"Length": "18\"", "Density": "180%"}
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  stock integer not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id, sort_order);
create unique index product_variants_combo_idx on public.product_variants (product_id, options);

alter table public.product_variants enable row level security;
create policy "public read variants" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));
create policy "admin write variants" on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

create function public.sync_product_from_variants() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    price = s.min_price,
    compare_at_price = s.compare_at,
    stock = s.total_stock
  from (
    select min(price) as min_price,
           (array_agg(compare_at_price order by price))[1] as compare_at,
           sum(stock)::int as total_stock
    from public.product_variants where product_id = v_pid
  ) s
  where p.id = v_pid and s.min_price is not null;
  return null;
end $$;

create trigger variants_sync after insert or update or delete on public.product_variants
  for each row execute function public.sync_product_from_variants();

-- ───────────── place_order: variant-aware, stock-safe ─────────────
create or replace function public.place_order(
  p_name text, p_phone text, p_address text, p_items jsonb
) returns table (order_id uuid, reference text, total integer)
language plpgsql security definer set search_path = public as $$
declare
  v_items jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_ref text := 'PH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_line record;
  v_prod public.products;
  v_var public.product_variants;
  v_price integer;
  v_label text;
  v_id uuid;
begin
  for v_line in
    select (i->>'product_id')::uuid as pid,
           nullif(i->>'variant_id', '')::uuid as vid,
           sum(greatest((i->>'quantity')::int, 1))::int as qty
    from jsonb_array_elements(p_items) i
    group by 1, 2
  loop
    select * into v_prod from public.products where id = v_line.pid and is_active for update;
    if not found then continue; end if;

    if v_line.vid is not null then
      select * into v_var from public.product_variants
        where id = v_line.vid and product_id = v_prod.id for update;
      if not found then raise exception 'That option is no longer available' using errcode = 'P0001'; end if;
      if v_line.qty > v_var.stock then
        raise exception 'Not enough stock for %', v_prod.name using errcode = 'P0001';
      end if;
      update public.product_variants set stock = stock - v_line.qty where id = v_var.id;
      v_price := v_var.price;
      select string_agg(v_var.options->>n, ' / ' order by ord) into v_label
        from unnest(v_prod.option_names) with ordinality as t(n, ord);
    else
      if cardinality(v_prod.option_names) > 0 then
        raise exception 'Please choose options for %', v_prod.name using errcode = 'P0001';
      end if;
      if v_line.qty > v_prod.stock then
        raise exception 'Not enough stock for %', v_prod.name using errcode = 'P0001';
      end if;
      update public.products set stock = stock - v_line.qty where id = v_prod.id;
      v_price := v_prod.price;
      v_label := null;
    end if;

    v_items := v_items || jsonb_build_object(
      'product_id', v_prod.id, 'variant_id', v_line.vid, 'name', v_prod.name, 'variant', v_label,
      'price', v_price, 'quantity', v_line.qty, 'image', v_prod.images[1]);
    v_total := v_total + v_price * v_line.qty;
  end loop;

  if jsonb_array_length(v_items) = 0 then raise exception 'Cart is empty' using errcode = 'P0001'; end if;

  insert into public.orders (reference, user_id, customer_name, customer_phone, delivery_address, items, total)
  values (v_ref, auth.uid(), p_name, p_phone, p_address, v_items, v_total)
  returning id into v_id;

  return query select v_id, v_ref, v_total;
end $$;

-- Cancelling returns stock to the right place (variant if the line had one).
create or replace function public.sync_stock_on_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_sign int; v_item jsonb;
begin
  if new.status = old.status then return new; end if;
  if new.status = 'cancelled' then v_sign := 1;
  elsif old.status = 'cancelled' then v_sign := -1;
  else return new; end if;

  for v_item in select * from jsonb_array_elements(new.items) loop
    if nullif(v_item->>'variant_id', '') is not null then
      update public.product_variants
        set stock = greatest(stock + v_sign * (v_item->>'quantity')::int, 0)
        where id = (v_item->>'variant_id')::uuid;
    else
      update public.products
        set stock = greatest(stock + v_sign * (v_item->>'quantity')::int, 0)
        where id = (v_item->>'product_id')::uuid;
    end if;
  end loop;
  return new;
end $$;
