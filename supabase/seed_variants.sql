-- Example variants for the seeded wigs. Idempotent: skips products that already have variants.
-- Human-hair wigs: Length x Density. Others: Length only.

with lengths(label, factor, ord) as (
  values ('14"', 0.80, 1), ('18"', 1.00, 2), ('22"', 1.25, 3), ('26"', 1.50, 4)
),
densities(label, factor, ord) as (values ('150%', 1.00, 1), ('180%', 1.15, 2)),
targets as (
  select p.id, p.price as base, p.slug from public.products p
  where p.category = 'wigs'
    and not exists (select 1 from public.product_variants v where v.product_id = p.id)
)
insert into public.product_variants (product_id, options, price, stock, sort_order)
select t.id,
       case when t.slug in ('curly-synthetic-wig', 'bob-style-wig')
            then jsonb_build_object('Length', l.label)
            else jsonb_build_object('Length', l.label, 'Density', d.label) end,
       (round(t.base * l.factor * case when t.slug in ('curly-synthetic-wig', 'bob-style-wig') then 1 else d.factor end / 500.0) * 500)::int,
       5,
       l.ord * 10 + d.ord
from targets t
cross join lengths l
join densities d on (t.slug not in ('curly-synthetic-wig', 'bob-style-wig') or d.ord = 1);

update public.products set option_names = '{"Length","Density"}'
  where category = 'wigs' and slug not in ('curly-synthetic-wig', 'bob-style-wig');
update public.products set option_names = '{"Length"}'
  where slug in ('curly-synthetic-wig', 'bob-style-wig');
