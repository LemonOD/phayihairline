-- 1) save_product(): one transaction for a product and its variants.
--    Before, the app saved the product, then deleted and upserted variants in separate calls, so a failure
--    in the middle left a half-saved product. Runs as the calling user, so RLS still applies; it also
--    checks is_admin() explicitly so a non-admin gets a clear error.
--
-- 2) place_order(): also returns the priced order lines.
--    The WhatsApp message used prices from the browser's saved cart, which can be stale, while the total
--    came from the server. Now the message is built from exactly what the server charged.
--
-- Safe to run on top of 0001-0005. The app keeps working before this is applied (it falls back to the
-- old multi-step save and to the cart's own prices), so there is no deploy-order trap.

-- ───────────── 1. Atomic product + variants ─────────────
create or replace function public.save_product(p_id uuid, p_product jsonb, p_variants jsonb)
returns uuid
language plpgsql set search_path = public as $$
declare
  v_id uuid := p_id;
  v_keep uuid[];
  v_features text[] := array(select jsonb_array_elements_text(coalesce(p_product->'features', '[]'::jsonb)));
  v_tags text[] := array(select jsonb_array_elements_text(coalesce(p_product->'tags', '[]'::jsonb)));
  v_images text[] := array(select jsonb_array_elements_text(coalesce(p_product->'images', '[]'::jsonb)));
  v_options text[] := array(select jsonb_array_elements_text(coalesce(p_product->'option_names', '[]'::jsonb)));
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  if v_id is null then
    insert into public.products
      (slug, name, description, price, compare_at_price, category, stock, features, tags, images,
       is_featured, is_active, option_names)
    values
      (p_product->>'slug', p_product->>'name', coalesce(p_product->>'description', ''),
       (p_product->>'price')::int, nullif(p_product->>'compare_at_price', '')::int,
       p_product->>'category', (p_product->>'stock')::int, v_features, v_tags, v_images,
       coalesce((p_product->>'is_featured')::boolean, false), coalesce((p_product->>'is_active')::boolean, true),
       v_options)
    returning id into v_id;
  else
    update public.products set
      name = p_product->>'name',
      description = coalesce(p_product->>'description', ''),
      price = (p_product->>'price')::int,
      compare_at_price = nullif(p_product->>'compare_at_price', '')::int,
      category = p_product->>'category',
      stock = (p_product->>'stock')::int,
      features = v_features, tags = v_tags, images = v_images,
      is_featured = coalesce((p_product->>'is_featured')::boolean, false),
      is_active = coalesce((p_product->>'is_active')::boolean, true),
      option_names = v_options
    where id = v_id;
    if not found then raise exception 'Product not found' using errcode = 'P0001'; end if;
  end if;

  -- Variants: remove the ones the admin dropped, upsert the rest in their displayed order.
  select coalesce(array_agg((v->>'id')::uuid) filter (where v->>'id' is not null), '{}')
    into v_keep from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb)) v;
  delete from public.product_variants where product_id = v_id and id <> all(v_keep);

  insert into public.product_variants (id, product_id, options, price, compare_at_price, stock, sort_order)
  select coalesce((v->>'id')::uuid, gen_random_uuid()), v_id, v->'options', (v->>'price')::int,
         nullif(v->>'compare_at_price', '')::int, (v->>'stock')::int, (ord - 1)::int
  from jsonb_array_elements(coalesce(p_variants, '[]'::jsonb)) with ordinality as t(v, ord)
  on conflict (id) do update set
    options = excluded.options, price = excluded.price, compare_at_price = excluded.compare_at_price,
    stock = excluded.stock, sort_order = excluded.sort_order;

  return v_id;
end $$;
grant execute on function public.save_product to authenticated;

-- ───────────── 2. place_order returns the priced lines ─────────────
-- The return type changes, so the old signature has to be dropped first.
drop function if exists public.place_order(text, text, text, jsonb);

create function public.place_order(
  p_name text, p_phone text, p_address text, p_items jsonb
) returns table (order_id uuid, reference text, total integer, items jsonb)
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

  return query select v_id, v_ref, v_total, v_items;
end $$;

grant execute on function public.place_order to anon, authenticated;
