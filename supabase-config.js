/* Project Nova — Supabase connection (shared by get-started.html + admin.html).
 *
 * Fill these in AFTER you create your free Supabase project:
 *   Supabase dashboard → Project Settings → API
 *     • url      = "Project URL"
 *     • anonKey  = "Project API keys → anon / public"
 *
 * The anon/public key is DESIGNED to live in the browser. Your data is protected by
 * Row Level Security (see supabase/schema.sql), not by hiding this key. Never put the
 * "service_role" key here — that one is a master key and must stay secret.
 *
 * Until you paste real values, the site keeps working on the FormSubmit email flow and
 * the admin dashboard shows a friendly "not set up yet" notice.
 */
window.NOVA_SUPABASE = {
  url:     'https://kgvgorpundpdqauokfnx.supabase.co',
  anonKey: 'sb_publishable_KwzH-u1BCCo9zxpRO7YDuA_66WNHcbN'
};

// True once real values are in place (used to switch features on automatically).
window.NOVA_SUPABASE_READY = !!(
  window.NOVA_SUPABASE.url &&
  window.NOVA_SUPABASE.anonKey &&
  !/YOUR-PROJECT-REF|YOUR-PUBLIC-ANON-KEY/.test(window.NOVA_SUPABASE.url + window.NOVA_SUPABASE.anonKey)
);
