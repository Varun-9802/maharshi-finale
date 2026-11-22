# Maharshi – Supabase setup

This update keeps the existing Next.js 16 / React / TypeScript application and its Tailwind-based UI. Supabase is used for authentication, private image storage, and per-user observation history. Open-Meteo provides weather forecasts without an API key.

## 1. Install dependencies

The repository uses pnpm (`packageManager` in `package.json`). Run:

```bash
pnpm install --no-frozen-lockfile
```

Then copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable/anon key from **Supabase → Project Settings → API**.

```bash
cp .env.example .env.local
```

Do not put a Supabase `service_role` key in browser-exposed environment variables.

## 2. Configure Supabase database and storage

In the Supabase dashboard, open **SQL Editor** and run the complete script:

`supabase/migrations/202611180001_initial_schema.sql`

It creates the `observations` table, row-level security policies, and a private `crop-images` storage bucket. Each user's records and images are restricted to that user's authenticated ID.

## 3. Configure authentication

In **Authentication → URL Configuration**, set the Site URL to your development URL (for example `http://localhost:3000`) and add these Redirect URLs:

- `http://localhost:3000/auth/callback`
- Your deployed app's `https://YOUR_DOMAIN/auth/callback`

Email/password authentication is enabled through Supabase Auth. For Google sign-in, enable the Google provider in **Authentication → Sign In / Providers**, enter the Google OAuth client ID and secret there, and add Supabase's displayed callback URL to the Google Cloud OAuth client's authorized redirect URIs. Never put the Google client secret in this app.

## 4. Run the app

```bash
pnpm dev
```

Unauthenticated visitors are redirected to `/login`. New users can register with email/password or Google. Email confirmation behavior follows the Supabase project's Auth settings.

## What is connected in this update

- Email/password sign-up and sign-in, Google OAuth sign-in, session refresh, protected app routes, and sign-out.
- User-owned observations and private crop-photo uploads (up to 8 images per observation, 10 MB each).
- Real observation history with a detail page to reopen the saved crop details and photos.
- Live weather and five-day forecast from Open-Meteo after the user grants browser location permission.

## Important project limitation

The uploaded source did not include a crop-image AI model endpoint or trained model integration. Its previous disease names, scores, risk overview, farmer profile, and weather values were hardcoded demonstration content. This update removes sample farmer/dashboard/history/weather records and labels the analysis output as illustrative demo data. It saves the crop details and photos, but does **not** claim to diagnose disease or combine weather with model predictions. A real model endpoint and validated crop-specific weather-risk rules must be connected before those results can be presented as predictions.
