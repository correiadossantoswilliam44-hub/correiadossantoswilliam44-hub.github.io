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
-- Anyone can SUBMIT a lead; only THE ADMIN (your exact email, signed in) can
-- READ/UPDATE/DELETE. Pinning to the email matters: Supabase projects allow
-- public sign-ups by default, so a policy granted to all "authenticated" users
-- would let a stranger create an account and read your leads. This one won't.
alter table public.leads enable row level security;

-- ⚠️ CHANGE THIS if your admin login (Step 3 of BACKEND-SETUP.md) uses a
--    different email. It must match EXACTLY (lowercase).
--    Admin email used below: correiadossantoswilliam44@gmail.com

drop policy if exists "anon can submit leads" on public.leads;
create policy "anon can submit leads" on public.leads
  for insert to anon with check (true);

drop policy if exists "authed can read leads" on public.leads;
create policy "authed can read leads" on public.leads
  for select to authenticated
  using ((auth.jwt()->>'email') = 'correiadossantoswilliam44@gmail.com');

drop policy if exists "authed can update leads" on public.leads;
create policy "authed can update leads" on public.leads
  for update to authenticated
  using ((auth.jwt()->>'email') = 'correiadossantoswilliam44@gmail.com')
  with check ((auth.jwt()->>'email') = 'correiadossantoswilliam44@gmail.com');

drop policy if exists "authed can delete leads" on public.leads;
create policy "authed can delete leads" on public.leads
  for delete to authenticated
  using ((auth.jwt()->>'email') = 'correiadossantoswilliam44@gmail.com');

-- Storage bucket for uploaded work photos (private; viewed via signed URLs) ---
insert into storage.buckets (id, name, public)
  values ('lead-photos','lead-photos',false)
  on conflict (id) do nothing;

drop policy if exists "anon can upload lead photos" on storage.objects;
create policy "anon can upload lead photos" on storage.objects
  for insert to anon with check (bucket_id = 'lead-photos');

drop policy if exists "authed can read lead photos" on storage.objects;
create policy "authed can read lead photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'lead-photos'
         and (auth.jwt()->>'email') = 'correiadossantoswilliam44@gmail.com');
