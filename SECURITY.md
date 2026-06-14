# Security notes — Project SuperNova

A short, honest record of how this site is hardened, what's enforced where, and
the few things that need a real host header layer (GitHub Pages can't set HTTP
headers). Audited against the VibeSec secure-coding guide.

## Architecture & trust model

- **Static site on GitHub Pages.** No server we control → we can't set HTTP
  response headers (CSP via header, HSTS, X-Frame-Options, etc.). What we can do
  is in the HTML (meta CSP, referrer policy) — see below.
- **Supabase** is the only backend. The browser holds the **anon/publishable
  key** (in `supabase-config.js`). That is safe **only because Row Level
  Security** restricts what anon can do. The `service_role` key is never in the
  site.
- **FormSubmit** is the no-backend fallback for the lead form.

## What's enforced, and where

### Access control (Supabase RLS — `supabase/schema.sql`)
- `anon` can **INSERT** a lead and **upload** to the private `lead-photos`
  bucket. Nothing else.
- **Read / update / delete** of leads is pinned to **one admin email** in the
  JWT (`auth.jwt()->>'email'`), not just "any authenticated user". This matters:
  Supabase allows public sign-ups by default, so a policy of `to authenticated`
  would let a stranger register and read your leads.
- Photos are in a **private** bucket, shown only via short-lived signed URLs.
- **Upload limits are server-side**: the bucket sets `file_size_limit` (8 MB)
  and `allowed_mime_types` (images only), so a crafted client using the public
  anon key still can't store non-images or huge files.

> **You must run `supabase/schema.sql`** (re-running is safe) **and** turn off
> "Allow new users to sign up" in Supabase → Authentication → Sign In/Up.
> Until then the email-pinned policies are the backstop, but disabling signups
> is the belt-and-suspenders step.

### XSS
- Marketing pages render **no** user input.
- `admin.html` renders attacker-controllable lead data (anyone can INSERT via
  the public anon key). It now: HTML-escapes every interpolated field, whitelists
  the `status` value before using it as a CSS class, and only turns a lead's
  "current site" into a clickable link if it's a real `http(s)` URL
  (`javascript:` / `data:` render as inert text). Photo URLs come from Supabase.

### Input validation
- Lead form: client-side `required` + type hints, and an **images-only / ≤8 MB /
  ≤10 files** guard before upload (defense + UX). Real enforcement is the bucket
  policy above. Uploaded filenames are randomized and stripped to `[\w.-]` (no
  path traversal / filename injection). DB writes go through the Supabase client
  (parameterized — no SQL injection).

### Headers we *can* set from a static page (in every page's `<head>`)
- `Content-Security-Policy` (meta) — `object-src 'none'; base-uri 'self';
  form-action 'self' https://formsubmit.co`. Blocks plugin/object injection and
  `<base>` hijacking, and limits where forms can post. (A full
  `script-src`/`connect-src` policy isn't set via meta because the site relies on
  inline scripts + several CDNs and `'unsafe-inline'` would neuter it anyway —
  do it at the header layer below instead.)
- `<meta name="referrer" content="strict-origin-when-cross-origin">`.

## What still needs a header layer (can't be done on GitHub Pages)

`frame-ancestors`, HSTS, `X-Frame-Options`, and `X-Content-Type-Options` are
**ignored** in `<meta>` — they must come as real HTTP headers. Put Cloudflare
(free) in front of Pages, or move to Netlify/Vercel, and apply:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  media-src 'self' blob:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com;
  form-action 'self' https://formsubmit.co;
  frame-ancestors 'none';
  base-uri 'self';
  object-src 'none';
```

Netlify `_headers` equivalent (one path block, `/*`) uses the same values.

## Known, accepted trade-offs

- **Admin session token in `localStorage`.** Supabase-JS stores the session there
  by default; on a static site there's no httpOnly-cookie option without a
  backend. The mitigation is keeping `admin.html` XSS-free (done above). If this
  ever needs to be airtight, move auth behind a small server/edge function.
- **Lead spam.** The INSERT policy accepts any lead row (there's a honeypot field
  on the form). If spam appears, add a captcha or a rate-limit edge function.
- **Pinned dependencies.** `three@0.160.0` is pinned; `@supabase/supabase-js@2`
  floats within v2. Consider pinning the exact version for reproducibility.
