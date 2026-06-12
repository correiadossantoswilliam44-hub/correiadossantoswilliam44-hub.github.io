# Project Nova — Lead Inbox backend setup

Your site now has a real backend: every `get-started.html` submission saves into a
database, and you get a private dashboard at **`/admin.html`** to manage leads.

It's **free** (Supabase free tier) and takes about **10 minutes** to turn on. Until you
finish these steps, the site keeps working exactly as before (leads email you via
FormSubmit), and `/admin.html` just shows a "not set up yet" notice.

---

## What you're setting up

```
 Visitor fills get-started.html
        │
        ├─►  Supabase database  ──►  /admin.html dashboard (you, logged in)
        │       + photo storage
        │
        └─►  (if Supabase ever errors) falls back to FormSubmit email — no lead lost
```

Security: the public can only **submit** leads. Only **you** (signed in) can read them.
That's enforced by Row Level Security in the database, so the key we put in the website
is safe to be public.

---

## Step 1 — Create a free Supabase project (~3 min)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. **New project**. Pick any name (e.g. `nova-leads`), choose a region near you
   (US East), and set a **database password** (save it somewhere — you won't need it
   day-to-day, but don't lose it).
3. Wait ~2 minutes for it to finish provisioning.

## Step 2 — Create the database (~1 min)

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file **`supabase/schema.sql`** from this repo, copy **all** of it, paste it
   into the editor, and click **Run**.
3. You should see "Success. No rows returned." That created the `leads` table, the
   security rules, and the `lead-photos` storage bucket.

## Step 3 — Create your admin login (~1 min)

1. Go to **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email + a password you'll remember, and **tick "Auto Confirm User"**
   (so you can log in immediately without a confirmation email).
3. This email + password is what you'll use to sign in at `/admin.html`.
   ⚠️ It must be **correiadossantoswilliam44@gmail.com** — the database rules in
   `schema.sql` only let that exact email read leads. (Different email? Edit the
   email in `schema.sql` first, then run it.)
4. **Lock out strangers:** go to **Authentication → Sign In / Up** and turn **off**
   "Allow new users to sign up". Supabase leaves this on by default, and the anon
   key in the site is public — without this, anyone could create an account.
   (Even if you forget, the email-pinned rules in `schema.sql` still keep your
   leads private — this step is belt *and* suspenders.)

## Step 4 — Copy your two keys (~1 min)

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **Project API keys → `anon` `public`** — a long string starting with `eyJ…`
   - ⚠️ Do **NOT** copy the `service_role` key. That one is secret — never put it in the site.

## Step 5 — Paste them into the site & publish (~2 min)

1. Open **`supabase-config.js`** and replace the two placeholder lines:

   ```js
   window.NOVA_SUPABASE = {
     url:     'https://abcdefgh.supabase.co',   // ← your Project URL
     anonKey: 'eyJhbGciOi...'                    // ← your anon / public key
   };
   ```

2. Save, then publish (from the `supernova-deploy` folder):

   ```bash
   git add supabase-config.js
   git commit -m "Wire up Supabase backend"
   git push
   ```

   *(Or just tell me "the keys are in" and I'll commit + push for you.)*

---

## Test it

1. Open **`/get-started.html`**, fill it in with a fake business, add a photo, submit.
2. Open **`/admin.html`**, sign in with your Step 3 login — your test lead should be
   right there, photo and all. Try changing its status (New → Contacted).
3. Delete the test lead when you're done.

---

## Good to know

- **Cost:** Supabase free tier = 500MB database + 1GB file storage + 50,000 monthly
  active users. You won't get near those limits for a long time. $0.
- **Notifications:** the dashboard is where leads live, but it won't ping you. The
  FormSubmit email still fires as a backup notifier, and later we can add an instant
  email/text on each new lead (Supabase Database Webhook) if you want.
- **Spam:** the form is public, so bots *can* submit junk. There's a honeypot field
  already; if spam ever becomes a problem, tell me and I'll add a rate-limit/captcha.
- **When the custom domain lands (Thursday):** also update the `_next` URL in
  `get-started.html` to the new domain so the success page redirect stays correct.
