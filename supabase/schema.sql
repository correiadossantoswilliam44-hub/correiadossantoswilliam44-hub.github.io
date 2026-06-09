-- ============================================================================
-- Project Nova — Lead Inbox / CRM schema for Supabase (Postgres)
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to run more than once (everything is "if not exists" / "drop policy if exists").
-- ============================================================================

-- 1. Lead status options ------------------------------------------------------
do $$ begin
  create type lead_status as enum ('new','contacted','demo_sent','won','lost');
exception when duplicate_object then null; end $$;

-- 2. Leads table --------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  business_name text not null,
  location      text,
  trade         text,
  phone         text,
  email         text,
  has_website   text,                  -- 'No, build me one' / 'Yes, rebuild it'
  current_site  text,
  notes         text,
  photo_paths   text[] not null default '{}',  -- object paths in the lead-photos bucket
  status        lead_status not null default 'new',
  source        text default 'get-started'
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

-- 3. Row Level Security -------------------------------------------------------
-- The whole security model: anyone can SUBMIT a lead, but only a logged-in admin
-- (you) can READ, UPDATE, or DELETE them. This is why exposing the anon key in the
-- front-end is safe — these policies, not the key, protect your data.
alter table public.leads enable row level security;

drop policy if exists "anon can submit leads" on public.leads;
create policy "anon can submit leads"
  on public.leads for insert to anon
  with check (true);

drop policy if exists "authed can read leads" on public.leads;
create policy "authed can read leads"
  on public.leads for select to authenticated
  using (true);

drop policy if exists "authed can update leads" on public.leads;
create policy "authed can update leads"
  on public.leads for update to authenticated
  using (true) with check (true);

drop policy if exists "authed can delete leads" on public.leads;
create policy "authed can delete leads"
  on public.leads for delete to authenticated
  using (true);

-- 4. Storage bucket for uploaded work photos ----------------------------------
-- Private bucket; the dashboard views photos through short-lived signed URLs.
insert into storage.buckets (id, name, public)
  values ('lead-photos', 'lead-photos', false)
  on conflict (id) do nothing;

drop policy if exists "anon can upload lead photos" on storage.objects;
create policy "anon can upload lead photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'lead-photos');

drop policy if exists "authed can read lead photos" on storage.objects;
create policy "authed can read lead photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'lead-photos');

-- Done. Next: create your admin login (Authentication → Users → Add user, tick
-- "Auto Confirm"), then paste your Project URL + anon key into supabase-config.js.
