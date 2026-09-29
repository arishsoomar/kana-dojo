-- Bowing (Z2). Paste this into the Supabase dashboard's SQL editor and run it once. It adds
-- the bows friends make to each other's dojos:
--
--   bows   who bowed, to whom, on which day (the bower's own calendar day), and whether the
--          one bowed to has seen it yet. One a day per friend: the primary key won't take a
--          second.
--
-- Bows are made by inserting a row, which the rules below only allow as yourself, to an
-- accepted friend, dated about today. They're marked seen through the function at the
-- bottom, never by changing rows directly.

create table public.bows (
  bower uuid not null references public.profiles (user_id) on delete cascade,
  bowed_to uuid not null references public.profiles (user_id) on delete cascade,
  day date not null,
  seen boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (bower, bowed_to, day),
  check (bower <> bowed_to)
);

alter table public.bows enable row level security;

create policy "See bows you made or got" on public.bows
  for select to authenticated
  using (bower = auth.uid() or bowed_to = auth.uid());

-- The day is the bower's own calendar day, which is at most a day either side of the
-- server's (timezones), so nobody can bow ahead for next week.
create policy "Bow to a friend, today" on public.bows
  for insert to authenticated
  with check (
    bower = auth.uid()
    and public.link_with(bowed_to) = 'accepted'
    and not seen
    and day between current_date - 1 and current_date + 1
  );

-- Marks every bow to the signed-in learner as seen: they've looked at their dojo.
create function public.mark_bows_seen()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.bows set seen = true where bowed_to = auth.uid() and not seen;
$$;

revoke execute on function public.mark_bows_seen() from public, anon;
grant execute on function public.mark_bows_seen() to authenticated;

-- Live: a friend's bow shows up while the Dojo tab is open.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bows'
  ) then
    alter publication supabase_realtime add table public.bows;
  end if;
end
$$;
