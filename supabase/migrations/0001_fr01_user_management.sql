-- FR-01 User Management
-- Creates: profiles, user_interests, avatars storage bucket
-- All tables: RLS enabled, users can only access their own rows.

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  age           int check (age between 13 and 120),
  gender        text check (gender in ('male','female','other','prefer_not_to_say')),
  travel_style  text check (travel_style in ('solo','family','group')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- user_interests (multi-select, fixed enum of 5)
-- ============================================================
create table public.user_interests (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  interest  text not null check (interest in ('food','culture','shopping','nature','adventure')),
  primary key (user_id, interest)
);

alter table public.user_interests enable row level security;

create policy "user_interests_select_own"
  on public.user_interests for select
  using (auth.uid() = user_id);

create policy "user_interests_insert_own"
  on public.user_interests for insert
  with check (auth.uid() = user_id);

create policy "user_interests_delete_own"
  on public.user_interests for delete
  using (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create a profile row when a new auth user signs up.
-- security definer so the trigger bypasses RLS during insert.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- avatars storage bucket: public read, owner-only write.
-- Object paths must be of the form "<uid>/<filename>".
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
