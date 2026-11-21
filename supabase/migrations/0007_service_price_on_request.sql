-- Some services can't be priced up front (it depends on the client's style and a conversation).
-- A null price now means "based on request". The existing check (price >= 0) still allows null.
alter table public.services alter column price drop not null;
