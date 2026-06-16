# BOTEPS Supabase Setup

## 1. Environment variables

Set these values locally in `.env.local` and in Vercel Project Settings > Environment Variables.

```txt
NEXT_PUBLIC_SITE_URL=https://botepswep.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

For older Supabase projects, the legacy anon key can be used in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, but new projects should prefer the publishable key.

## 2. Database schema

Open Supabase Dashboard > SQL Editor and run `supabase/schema.sql`.

This creates:

- `profiles`
- `courses`
- `course_chapters`
- `subscriptions`
- `watch_progress`
- `bookmarks`

It also enables RLS and creates basic owner-read/write policies.

## 3. Auth URLs

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://botepswep.vercel.app`
- Redirect URL: `https://botepswep.vercel.app/auth/callback`
- Local Redirect URL: `http://localhost:3000/auth/callback`

## 4. Google provider

In Supabase Dashboard > Authentication > Providers > Google:

1. Enable Google.
2. Paste the Google OAuth Client ID and Client Secret.
3. In Google Cloud OAuth client settings, add:
   - Authorized JavaScript origin: `https://botepswep.vercel.app`
   - Authorized redirect URI: your Supabase Google callback URL from the provider screen

## 5. Supported login methods

- BOTEPS email/password signup and login
- Google OAuth login
- Supabase session cookies through Next.js proxy
