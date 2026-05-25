-- Phoenix YT Drafts — Supabase schema setup
-- Paste into Supabase project's SQL Editor and click "Run".
-- Re-runnable: safe to execute multiple times.

create table if not exists public.drafts (
  id                   text primary key,
  title_override       text,
  description_override text,
  tags_override        text,
  posted_at            timestamptz,
  updated_at           timestamptz not null default now()
);

-- Auto-bump updated_at on every change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists drafts_set_updated_at on public.drafts;
create trigger drafts_set_updated_at
  before update on public.drafts
  for each row execute function public.set_updated_at();

-- Single-user app behind a soft password gate: allow anon role full
-- access. Tighten later by adding Supabase Auth + per-user policies.
alter table public.drafts enable row level security;

drop policy if exists "anon-read-write" on public.drafts;
create policy "anon-read-write"
  on public.drafts
  for all
  to anon
  using (true)
  with check (true);

-- Enable realtime so other devices see edits live.
alter publication supabase_realtime add table public.drafts;
