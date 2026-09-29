import { parseFriendSummary, type FriendSummary, type Link } from '@/core/friends';

import { supabase } from './supabase';

// Friends on the server (Epic Y): the tables and functions in
// supabase/migrations/20261001000000_friends.sql. Row-level security there decides what each
// learner can read, so these just ask; what comes back from other learners is checked.

export type Profile = { name: string; code: string };

export type Friend = Link & {
  summary: FriendSummary | null; // accepted friends only, once they've synced
};

// Something went wrong reaching the server. `missing` means the tables aren't there yet (the
// SQL hasn't been run on this project).
export type FriendsError = { missing: boolean };

type Result<T> = { ok: true; value: T } | { ok: false; error: FriendsError };

// PostgREST's code for a table it doesn't know about.
const NO_TABLE = 'PGRST205';

function failed<T>(error: { code?: string } | null): Result<T> {
  return { ok: false, error: { missing: error?.code === NO_TABLE || error?.code === '42P01' } };
}

// The learner's own profile, or null if they haven't chosen a name yet.
export async function loadProfile(userId: string): Promise<Result<Profile | null>> {
  if (!supabase) return failed(null);
  const { data, error } = await supabase.from('profiles').select('name, friend_code').eq('user_id', userId).maybeSingle();
  if (error) return failed(error);
  return { ok: true, value: data ? { name: String(data.name), code: String(data.friend_code) } : null };
}

// Creates the learner's profile. A code already taken by someone else fails with 'taken', so
// the caller can try another.
export async function createProfile(userId: string, name: string, code: string): Promise<Result<'created' | 'taken'>> {
  if (!supabase) return failed(null);
  const { error } = await supabase.from('profiles').insert({ user_id: userId, name, friend_code: code });
  // 23505: a unique value (here, the friend code) already in use.
  if (error?.code === '23505') return { ok: true, value: 'taken' };
  if (error) return failed(error);
  return { ok: true, value: 'created' };
}

export async function renameProfile(userId: string, name: string): Promise<Result<null>> {
  if (!supabase) return failed(null);
  const { error } = await supabase.from('profiles').update({ name, updated_at: new Date().toISOString() }).eq('user_id', userId);
  return error ? failed(error) : { ok: true, value: null };
}

// Shares the learner's summary with their friends. Only works once they have a profile.
export async function uploadSummary(userId: string, summary: FriendSummary): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('summaries').upsert({ user_id: userId, summary, updated_at: new Date().toISOString() });
  return !error;
}

// Everyone the learner is linked to: friends, and requests either way.
export async function loadFriends(userId: string): Promise<Result<Friend[]>> {
  if (!supabase) return failed(null);
  const links = await supabase.from('friendships').select('requester, addressee, accepted');
  if (links.error) return failed(links.error);

  const others = links.data.map((row) => {
    const outgoing = row.requester === userId;
    const other = String(outgoing ? row.addressee : row.requester);
    const state: Friend['state'] = row.accepted ? 'accepted' : outgoing ? 'outgoing' : 'incoming';
    return { userId: other, state };
  });
  if (others.length === 0) return { ok: true, value: [] };

  const ids = others.map((o) => o.userId);
  const [profiles, summaries] = await Promise.all([
    supabase.from('profiles').select('user_id, name').in('user_id', ids),
    supabase.from('summaries').select('user_id, summary').in('user_id', ids),
  ]);
  if (profiles.error) return failed(profiles.error);
  if (summaries.error) return failed(summaries.error);

  const names = new Map(profiles.data.map((p) => [String(p.user_id), String(p.name)]));
  const shared = new Map(summaries.data.map((s) => [String(s.user_id), parseFriendSummary(s.summary)]));
  return {
    ok: true,
    value: others.map((o) => ({
      ...o,
      name: names.get(o.userId) ?? 'A learner',
      summary: o.state === 'accepted' ? (shared.get(o.userId) ?? null) : null,
    })),
  };
}

export type RequestOutcome = 'sent' | 'accepted' | 'already' | 'self' | 'not-found' | 'no-profile';

// Sends a friend request to whoever has this code (or accepts theirs, if they'd asked first).
export async function requestFriend(code: string): Promise<Result<{ outcome: RequestOutcome; name: string | null }>> {
  if (!supabase) return failed(null);
  const { data, error } = await supabase.rpc('request_friend', { code });
  if (error) return failed(error);
  const reply = (data ?? {}) as { status?: unknown; name?: unknown };
  const outcomes: readonly RequestOutcome[] = ['sent', 'accepted', 'already', 'self', 'not-found', 'no-profile'];
  const outcome = outcomes.find((o) => o === reply.status) ?? 'not-found';
  return { ok: true, value: { outcome, name: typeof reply.name === 'string' ? reply.name : null } };
}

export async function acceptFriend(other: string): Promise<Result<null>> {
  if (!supabase) return failed(null);
  const { error } = await supabase.rpc('accept_friend', { other });
  return error ? failed(error) : { ok: true, value: null };
}

// Removes a friend, declines a request, or cancels one: whichever link there is, either way.
export async function removeLink(userId: string, other: string): Promise<Result<null>> {
  if (!supabase) return failed(null);
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(requester.eq.${userId},addressee.eq.${other}),and(requester.eq.${other},addressee.eq.${userId})`);
  return error ? failed(error) : { ok: true, value: null };
}
