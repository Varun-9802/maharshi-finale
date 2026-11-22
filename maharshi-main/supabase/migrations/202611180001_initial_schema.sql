-- Run this migration in Supabase SQL Editor.
create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crop text not null,
  crop_age text,
  symptoms text,
  image_paths text[] not null default '{}',
  conversation jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  analysis_status text not null default 'pending' check (analysis_status in ('pending','completed','failed')),
  model_result jsonb,
  weather_snapshot jsonb
);
create index if not exists observations_user_created_idx on public.observations(user_id, created_at desc);
alter table public.observations enable row level security;
create policy "Users can read their observations" on public.observations for select using (auth.uid() = user_id);
create policy "Users can create their observations" on public.observations for insert with check (auth.uid() = user_id);
create policy "Users can update their observations" on public.observations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their observations" on public.observations for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crop-images', 'crop-images', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;
create policy "Users can upload their crop images" on storage.objects for insert to authenticated
with check (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can view their crop images" on storage.objects for select to authenticated
using (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their crop images" on storage.objects for delete to authenticated
using (bucket_id = 'crop-images' and (storage.foldername(name))[1] = auth.uid()::text);
