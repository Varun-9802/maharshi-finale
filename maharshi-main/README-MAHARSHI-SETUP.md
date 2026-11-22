# Maharshi – local setup

Maharshi is a college-project crop-health demonstration with a Next.js website, Supabase authentication and private image history, a TensorFlow PlantVillage classifier, and Open-Meteo weather data.

## Quick start on Windows

From the repository root, run `START-MAHARSHI.ps1` in PowerShell. It opens separate backend and website terminals, creates the Python virtual environment if needed, and installs missing dependencies. Before signing in, fill in the Supabase values in `maharshi-main/.env.local`.

## 1. Requirements

- Node.js 20.9 or newer and npm
- Python 3.10 or 3.11 (TensorFlow 2.16.1)
- A Supabase project
- A machine with enough memory to load the TensorFlow model

## 2. Configure Supabase

1. In Supabase, open **SQL Editor**.
2. Run these migrations in order:
   - `supabase/migrations/202611180001_initial_schema.sql`
   - `supabase/migrations/202611220001_add_ai_results.sql`
3. The first migration creates the `observations` table, row-level security, and the private `crop-images` bucket. The second adds the AI prediction and weather result columns.
4. In **Project Settings → API**, copy the project URL and publishable/anon key.

The table is user-scoped through Supabase RLS. Do not put a service-role key in the browser app.

## 3. Configure and run the website

From this directory (`maharshi-main`):

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Edit `.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAHARSHI_AI_URL=http://127.0.0.1:8000`

Open http://localhost:3000.

For Supabase **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs. Configure Google OAuth in Supabase only if you want Google sign-in; email/password works without Google OAuth.

## 4. Configure and run the AI service

Open a second PowerShell terminal from the repository's `maharshi-ai` directory:

```powershell
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

The trained model and its 38 class labels are in `models/`. Check http://127.0.0.1:8000/health; it should report `model_loaded: true` and `classes: 38`.

If the browser is on a different machine, do not use 127.0.0.1 for the AI URL: deploy the API or use a reachable HTTPS URL and set `NEXT_PUBLIC_MAHARSHI_AI_URL` accordingly. The API must be running whenever image analysis is used.

## 5. Main workflow

1. Sign in or create an account.
2. Enter crop, crop age, symptoms, and upload up to eight photos (10 MB each).
3. The first photo is sent to the TensorFlow model for classification.
4. Local weather is retrieved from Open-Meteo after browser location permission is granted.
5. The observation and private photos are saved to Supabase Storage and `observations`.
6. The prediction, confidence, top predictions, and available weather-based risk estimate are saved back to that same observation.
7. Open **History** to see previous observations and their detail pages.

## Important limitations

- The classifier has 38 PlantVillage classes. It is not a universal crop detector; crops/classes outside the training labels cannot be reliably identified.
- A model confidence is not a guarantee of correctness. Treat the output as a screening aid and confirm important diagnoses with a local agricultural expert.
- The weather risk score is a simple demonstration heuristic using current humidity, precipitation, and temperature. It is not a scientifically validated, crop- and disease-specific epidemiological forecast.
- Browser location and the AI API require network access. Supabase credentials, OAuth settings, storage bucket, and SQL migrations must be configured in the user's own project.
- The reminder button and some profile/language preferences are demonstration UI, not push notifications or a fully persisted farmer profile.
