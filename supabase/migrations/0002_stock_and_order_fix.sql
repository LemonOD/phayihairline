-- Fixes checkout (gen_random_bytes is not on the search_path on Supabase)
-- and makes orders reserve stock. Safe to run on top of 0001.

create or replace function public.place_order(
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
  -- Merge duplicate lines, lock the product rows so concurrent orders can't oversell.
  for v_row in
    select p.id, p.name, p.price, p.stock, p.images[1] as image, sum(greatest((i->>'quantity')::int, 1))::int as qty
    from jsonb_array_elements(p_items) i
    join public.products p on p.id = (i->>'product_id')::uuid and p.is_active
    group by p.id
    for update of p
  loop
    if v_row.qty > v_row.stock then
      raise exception 'Not enough stock for %', v_row.name using errcode = 'P0001';
    end if;

    update public.products set stock = stock - v_row.qty where id = v_row.id;
    v_items := v_items || jsonb_build_object(
      'product_id', v_row.id, 'name', v_row.name, 'price', v_row.price,
      'quantity', v_row.qty, 'image', v_row.image);
    v_total := v_total + v_row.price * v_row.qty;
  end loop;

  if jsonb_array_length(v_items) = 0 then raise exception 'Cart is empty' using errcode = 'P0001'; end if;

  insert into public.orders (reference, user_id, customer_name, customer_phone, delivery_address, items, total)
  values (v_ref, auth.uid(), p_name, p_phone, p_address, v_items, v_total)
  returning id into v_id;

  return query select v_id, v_ref, v_total;
end $$;

-- Cancelling an order returns its stock (and un-cancelling takes it back).
create or replace function public.sync_stock_on_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_sign int;
begin
  if new.status = old.status then return new; end if;
  if new.status = 'cancelled' then v_sign := 1;
  elsif old.status = 'cancelled' then v_sign := -1;
  else return new; end if;

  update public.products p
  set stock = greatest(p.stock + v_sign * (i->>'quantity')::int, 0)
  from jsonb_array_elements(new.items) i
  where p.id = (i->>'product_id')::uuid;
  return new;
end $$;

drop trigger if exists orders_sync_stock on public.orders;
create trigger orders_sync_stock after update of status on public.orders
  for each row execute function public.sync_stock_on_cancel();
