create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('alert', 'offer', 'message')),
  title text not null,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "users insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.notifications;

create or replace function public.broadcast_notification(p_title text, p_body text)
returns void language plpgsql security definer as $$
begin
  if not (select is_current_user_admin()) then
    raise exception 'Admin only';
  end if;
  insert into public.notifications (user_id, category, title, body)
  select id, 'message', p_title, p_body from public.profiles;
end;
$$;
