-- FR-12: Travel Planning
-- Tables: itineraries, itinerary_items

create table itineraries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  start_date date not null,
  end_date   date not null,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_date >= start_date)
);

alter table itineraries enable row level security;

create policy "users manage own itineraries"
  on itineraries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index itineraries_user_id_idx on itineraries(user_id);


create table itinerary_items (
  id             uuid primary key default gen_random_uuid(),
  itinerary_id   uuid not null references itineraries(id) on delete cascade,
  place_id       uuid references places(id) on delete cascade,
  event_id       uuid references events(id) on delete cascade,
  custom_title   text,
  day_number     int  not null check (day_number >= 1),
  start_time     time,
  notes          text,
  sort_order     int  not null default 0,
  constraint at_least_one check (
    place_id is not null or event_id is not null or custom_title is not null
  )
);

alter table itinerary_items enable row level security;

create policy "users manage own itinerary items"
  on itinerary_items for all
  using (
    exists (
      select 1 from itineraries
      where itineraries.id = itinerary_items.itinerary_id
        and itineraries.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from itineraries
      where itineraries.id = itinerary_items.itinerary_id
        and itineraries.user_id = auth.uid()
    )
  );

create index itinerary_items_itinerary_id_idx on itinerary_items(itinerary_id);
