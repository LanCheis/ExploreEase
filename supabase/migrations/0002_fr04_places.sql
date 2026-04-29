-- FR-04 Discovery (places + favorites)
-- places: read-only to authenticated users. No client write policies (admin writes via FR-11).
-- favorites: owner-only CRUD. Schema only this chat; no UI uses it yet.

-- ============================================================
-- places
-- ============================================================
create table public.places (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  category     text not null check (category in ('attraction','cuisine','activity')),
  address      text,
  lat          double precision,
  lng          double precision,
  price_level  int check (price_level between 1 and 4),
  image_url    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index places_category_idx on public.places (category);

alter table public.places enable row level security;

create policy "places_select_authenticated"
  on public.places for select
  to authenticated
  using (true);

create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

-- ============================================================
-- favorites
-- ============================================================
create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  place_id   uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create index favorites_place_idx on public.favorites (place_id);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);
