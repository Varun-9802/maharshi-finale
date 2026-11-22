-- Persist AI analysis, weather risk and follow-up tracking for each observation.
alter table public.observations
  add column if not exists predicted_crop text,
  add column if not exists predicted_disease text,
  add column if not exists prediction_confidence numeric,
  add column if not exists predicted_class text,
  add column if not exists top_predictions jsonb,
  add column if not exists risk_score integer,
  add column if not exists risk_level text,
  add column if not exists weather_snapshot jsonb,
  add column if not exists prevention_recommendations jsonb,
  add column if not exists next_photo_recommended_at timestamptz,
  add column if not exists follow_up_status text not null default 'pending',
  add column if not exists parent_observation_id uuid references public.observations(id) on delete set null;

create index if not exists observations_user_created_idx
  on public.observations (user_id, created_at desc);
create index if not exists observations_follow_up_idx
  on public.observations (user_id, next_photo_recommended_at)
  where follow_up_status = 'pending';
