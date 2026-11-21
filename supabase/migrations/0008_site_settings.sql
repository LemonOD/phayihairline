-- Small key/value store for settings the owner edits from the admin area (no redeploy needed).
-- First use: 'bank_details', the account customers pay into after checkout.
-- Anyone can read the keys listed below, so never put a secret in these rows.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "public read bank details" on public.site_settings
  for select using (key = 'bank_details');

create policy "admins manage settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());
