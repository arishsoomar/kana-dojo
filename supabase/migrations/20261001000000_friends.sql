-- Friends (Epic Y). Paste this whole file into the Supabase dashboard's SQL editor and run it
-- once. It adds three tables and the rules for who can read and change them:
--
--   profiles     each learner's name and friend code. Seen by the learner, and by anyone they
--                have a friend request with (either way), so a request shows who it's from.
--   summaries    what a friend can see: rank, streak, today's training and the dojo room.
--                Seen only by the learner and their accepted friends.
--   friendships  one row per request: who asked, who was asked, and whether it was accepted.
--
-- Requests are made and accepted through the two functions at the bottom, never by writing
-- friendship rows directly, so nobody can make themselves someone's friend.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  friend_code text not null unique check (friend_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  updated_at timestamptz not null default now()
);

create table public.summaries (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  summary jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.friendships (
  requester uuid not null references public.profiles (user_id) on delete cascade,
  addressee uuid not null references public.profiles (user_id) on delete cascade,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (requester, addressee),
  check (requester <> addressee)
);

alter table public.profiles enable row level security;
alter table public.summaries enable row level security;
alter table public.friendships enable row level security;

-- How the signed-in learner is linked to `other`: 'accepted', 'pending' (a request either way),
-- or null. Security definer so the policies below can look at friendships without looping.
create function public.link_with(other uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case when bool_or(f.accepted) then 'accepted' when count(*) > 0 then 'pending' end
  from public.friendships f
  where (f.requester = auth.uid() and f.addressee = other)
     or (f.addressee = auth.uid() and f.requester = other)
$$;

create policy "Own profile, and anyone linked by a request" on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or public.link_with(user_id) is not null);
create policy "Create own profile" on public.profiles
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "Change own profile" on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Own summary, and accepted friends'" on public.summaries
  for select to authenticated
  using (user_id = auth.uid() or public.link_with(user_id) = 'accepted');
create policy "Write own summary" on public.summaries
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "Update own summary" on public.summaries
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "See own requests and friends" on public.friendships
  for select to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
create policy "Remove a friend, or decline or cancel a request" on public.friendships
  for delete to authenticated
  using (requester = auth.uid() or addressee = auth.uid());

-- Sends a friend request to the learner with this code. If they had already asked, it accepts
-- theirs instead. Returns the outcome and their name:
--   {"status": "sent" | "accepted" | "already" | "self" | "not-found" | "no-profile", "name": ...}
create function public.request_friend(code text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  other public.profiles;
begin
  if me is null then
    raise exception 'Not signed in';
  end if;
  if not exists (select 1 from public.profiles where user_id = me) then
    return json_build_object('status', 'no-profile');
  end if;
  select * into other from public.profiles where friend_code = upper(code);
  if other.user_id is null then
    return json_build_object('status', 'not-found');
  end if;
  if other.user_id = me then
    return json_build_object('status', 'self');
  end if;
  if exists (
    select 1 from public.friendships
    where (requester = me and addressee = other.user_id)
       or (requester = other.user_id and addressee = me and accepted)
  ) then
    return json_build_object('status', 'already', 'name', other.name);
  end if;
  update public.friendships set accepted = true where requester = other.user_id and addressee = me;
  if found then
    return json_build_object('status', 'accepted', 'name', other.name);
  end if;
  insert into public.friendships (requester, addressee) values (me, other.user_id);
  return json_build_object('status', 'sent', 'name', other.name);
end;
$$;

-- Accepts a request someone sent the signed-in learner.
create function public.accept_friend(other uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.friendships set accepted = true where requester = other and addressee = auth.uid();
$$;

revoke execute on function public.request_friend(text) from public, anon;
revoke execute on function public.accept_friend(uuid) from public, anon;
revoke execute on function public.link_with(uuid) from public, anon;
grant execute on function public.request_friend(text) to authenticated;
grant execute on function public.accept_friend(uuid) to authenticated;
grant execute on function public.link_with(uuid) to authenticated;
