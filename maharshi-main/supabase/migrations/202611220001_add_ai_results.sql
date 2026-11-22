-- Persist the AI model output and weather-based risk alongside each observation.
-- Safe to run on projects created with either the original schema or the updated table.
alter table public.observations
  add column if not exists predicted_crop text,
  add column if not exists predicted_disease text,
  add column if not exists prediction_confidence numeric,
  add column if not exists predicted_class text,
  add column if not exists top_predictions jsonb,
  add column if not exists risk_score integer,
  add column if not exists risk_level text,
  add column if not exists weather_snapshot jsonb,
  add column if not exists prevention_recommendations jsonb;

create index if not exists observations_user_created_idx
  on public.observations (user_id, created_at desc);
