-- Prevent overlapping appointments at the database level.
--
-- Before: one active booking per exact start time, so a 3-hour service at 09:00 still left
-- 10:00 and 11:00 bookable. Now every booking has an end time and Postgres rejects any
-- overlap between active (pending/confirmed) bookings.
--
-- If this fails at "add constraint", existing active bookings already overlap. Find them with:
--   select a.id, b.id from bookings a join bookings b
--     on a.id < b.id and tstzrange(a.starts_at, a.ends_at) && tstzrange(b.starts_at, b.ends_at)
--   where a.status in ('pending','confirmed') and b.status in ('pending','confirmed');
-- cancel or move one of each pair, then re-run.

create extension if not exists btree_gist;

alter table public.bookings add column if not exists ends_at timestamptz;

-- A service blocks whole hours (matches the booking page, which rounds durations up).
create or replace function public.booking_end(p_service uuid, p_start timestamptz)
returns timestamptz language sql stable as $$
  select p_start + make_interval(hours => ceil(s.duration_minutes / 60.0)::int)
  from public.services s where s.id = p_service;
$$;

update public.bookings set ends_at = public.booking_end(service_id, starts_at) where ends_at is null;
alter table public.bookings alter column ends_at set not null;

create or replace function public.set_booking_end() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.ends_at := public.booking_end(new.service_id, new.starts_at);
  return new;
end $$;

drop trigger if exists bookings_set_end on public.bookings;
create trigger bookings_set_end before insert or update of starts_at, service_id on public.bookings
  for each row execute function public.set_booking_end();

alter table public.bookings add constraint bookings_no_overlap
  exclude using gist (tstzrange(starts_at, ends_at) with &&)
  where (status in ('pending', 'confirmed'));

-- Anonymous visitors still see only *when* time is taken, never who booked.
drop function if exists public.taken_slots(timestamptz, timestamptz);
create function public.taken_slots(p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select b.starts_at, b.ends_at from public.bookings b
  where b.status in ('pending', 'confirmed') and b.starts_at < p_to and b.ends_at > p_from;
$$;
grant execute on function public.taken_slots to anon, authenticated;
