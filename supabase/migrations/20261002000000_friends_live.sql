-- Friends, live (Y3). Paste this into the Supabase dashboard's SQL editor and run it once
-- (running it again does nothing). It tells Supabase Realtime to pass on changes to requests
-- and summaries, so the app hears about a new request, an acceptance, or a friend's training
-- as it happens. Realtime checks the same row-level security as everything else: each
-- learner only hears about rows they could read anyway.

do $$
declare
  t text;
begin
  foreach t in array array['friendships', 'summaries'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;
