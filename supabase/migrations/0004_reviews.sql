-- Verified-buyer reviews. Only a signed-in customer with a confirmed/shipped/delivered order
-- containing the product can review it, once. Enforced in Postgres, not just the UI.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_product_idx on public.reviews (product_id, created_at desc) where status = 'published';

alter table public.reviews enable row level security;
create policy "public read published reviews" on public.reviews for select
  using (status = 'published' or user_id = auth.uid() or public.is_admin());
create policy "delete own review" on public.reviews for delete using (user_id = auth.uid());
create policy "admin moderate reviews" on public.reviews for update using (public.is_admin());
create policy "admin delete reviews" on public.reviews for delete using (public.is_admin());
-- No INSERT policy: reviews can only be created through submit_review().

create function public.submit_review(p_product_id uuid, p_rating int, p_title text, p_body text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order uuid;
  v_name text;
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in to leave a review' using errcode = 'P0001'; end if;

  select o.id into v_order from public.orders o
  where o.user_id = auth.uid()
    and o.status in ('confirmed', 'shipped', 'delivered')
    and o.items @> jsonb_build_array(jsonb_build_object('product_id', p_product_id))
  order by o.created_at desc limit 1;

  if v_order is null then
    raise exception 'Only customers who bought this product can review it' using errcode = 'P0001';
  end if;

  select coalesce(nullif(split_part(trim(full_name), ' ', 1), ''), 'Verified buyer')
    || coalesce(' ' || nullif(left(split_part(trim(full_name), ' ', 2), 1), '') || '.', '')
  into v_name from public.profiles where id = auth.uid();

  insert into public.reviews (product_id, user_id, order_id, author_name, rating, title, body)
  values (p_product_id, auth.uid(), v_order, coalesce(v_name, 'Verified buyer'), p_rating,
          nullif(trim(p_title), ''), trim(p_body))
  returning id into v_id;
  return v_id;
exception when unique_violation then
  raise exception 'You have already reviewed this product' using errcode = 'P0001';
end $$;
grant execute on function public.submit_review to authenticated;

-- Keep products.rating / review_count truthful.
create function public.refresh_product_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    rating = coalesce(s.avg, 0), review_count = s.cnt
  from (select round(avg(rating)::numeric, 1) as avg, count(*)::int as cnt
        from public.reviews where product_id = v_pid and status = 'published') s
  where p.id = v_pid;
  return null;
end $$;

create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- The seeded ratings were placeholder numbers, not real feedback. Start honest.
update public.products set rating = 0, review_count = 0;
