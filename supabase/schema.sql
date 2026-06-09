-- ============================================================================
-- Project Nova — Lead Inbox / CRM schema for Supabase (Postgres)
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → CLEAR the box
-- (Ctrl+A, Delete) → paste all of this → Run. Safe to run more than once.
--
-- `status` is a plain text column (values: new / contacted / demo_sent / won / lost),
-- kept simple on purpose — the admin dashboard supplies the allowed values.
-- ============================================================================

-- Leads table ----------------------------------------------------------------
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
  status        text not null default 'new',
  source        text default 'get-started'
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

-- Row Level Security ---------------------------------------------------------
-- Anyone can SUBMIT a lead; only a logged-in admin (you) can READ/UPDATE/DELETE.
-- This is why exposing the publishable key in the front-end is safe.
alter table public.leads enable row level security;

drop policy if exists "anon can submit leads" on public.leads;
create policy "anon can submit leads" on public.leads
  for insert to anon with check (true);

drop policy if exists "authed can read leads" on public.leads;
create policy "authed can read leads" on public.leads
  for select to authenticated using (true);

drop policy if exists "authed can update leads" on public.leads;
create policy "authed can update leads" on public.leads
  for update to authenticated using (true) with check (true);

drop policy if exists "authed can delete leads" on public.leads;
create policy "authed can delete leads" on public.leads
  for delete to authenticated using (true);

-- Storage bucket for uploaded work photos (private; viewed via signed URLs) ---
insert into storage.buckets (id, name, public)
  values ('lead-photos','lead-photos',false)
  on conflict (id) do nothing;

drop policy if exists "anon can upload lead photos" on storage.objects;
create policy "anon can upload lead photos" on storage.objects
  for insert to anon with check (bucket_id = 'lead-photos');

drop policy if exists "authed can read lead photos" on storage.objects;
create policy "authed can read lead photos" on storage.objects
  for select to authenticated using (bucket_id = 'lead-photos');
