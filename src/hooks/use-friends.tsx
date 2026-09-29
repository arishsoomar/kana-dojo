import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import {
  isFriendCode,
  isValidName,
  linkNews,
  makeFriendCode,
  normalizeFriendCode,
  normalizeName,
  waitingRequests,
  type FriendNews,
} from '@/core/friends';
import {
  acceptFriend,
  bowTo,
  createProfile,
  loadBows,
  loadFriends,
  loadProfile,
  markBowsSeen,
  NO_BOWS,
  removeLink,
  renameProfile,
  requestFriend,
  uploadSummary,
  type BowOutcome,
  type Bows,
  type Friend,
  type Profile,
} from '@/storage/friends';
import { supabase } from '@/storage/supabase';

import { useFriendSummary } from './friend-sync';
import { useAuth } from './use-auth';
import { useToday } from './use-today';

// Where the friends list stands: signed out, loading, the server's friend tables missing,
// the server unreachable, no name chosen yet, or ready.
export type FriendsStatus = 'signed-out' | 'loading' | 'missing' | 'error' | 'no-profile' | 'ready';

// Tries at a friend code that isn't taken, before giving up.
const CODE_TRIES = 5;
// After a change on the server, wait this long for more before loading the list again, so a
// burst of changes is one load.
const RELOAD_AFTER_MS = 600;

type FriendsValue = {
  status: FriendsStatus;
  profile: Profile | null;
  friends: Friend[];
  waiting: number; // requests waiting for your answer
  news: FriendNews | null; // the next thing to tell you about, if any
  dismissNews: () => void;
  refresh: () => Promise<void>;
  saveName: (text: string) => Promise<string | null>;
  add: (text: string) => Promise<string>;
  accept: (other: string) => Promise<void>;
  remove: (other: string) => Promise<void>;
  bowedToday: readonly string[]; // friends you've bowed to today
  bowers: string[]; // names of friends who bowed to your dojo since you last looked
  bow: (other: string) => Promise<BowOutcome>;
  seeBows: () => void; // you've looked: they're marked seen
};

// What was last loaded, and for which account.
type Loaded = { userId: string; status: FriendsStatus; profile: Profile | null; friends: Friend[]; bows: Bows };

const FriendsContext = createContext<FriendsValue | null>(null);

// The signed-in learner's profile and friends, kept for the whole app, so the Friends screen,
// the badge on the Dojo tab and the banner all agree. It loads when they sign in, again when
// the app comes back to the front, and as soon as the server says something changed: a
// request, an acceptance, or a friend's training.
export function FriendsProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const today = useToday();
  const summary = useFriendSummary();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [queue, setQueue] = useState<FriendNews[]>([]);
  // The list as last loaded, to tell what's new. Before the first load there's nothing to
  // compare with, so everything already there isn't news.
  const known = useRef<{ userId: string; friends: Friend[] } | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const done = (status: FriendsStatus, profile: Profile | null = null, friends: Friend[] = [], bows: Bows = NO_BOWS) =>
      setLoaded({ userId, status, profile, friends, bows });
    const mine = await loadProfile(userId);
    if (!mine.ok) return done(mine.error.missing ? 'missing' : 'error');
    if (!mine.value) return done('no-profile');
    const [list, bows] = await Promise.all([loadFriends(userId), loadBows(userId, today)]);
    if (!list.ok) return done(list.error.missing ? 'missing' : 'error', mine.value);

    const before = known.current?.userId === userId ? known.current.friends : null;
    known.current = { userId, friends: list.value };
    const fresh = before ? linkNews(before, list.value) : [];
    if (fresh.length > 0) setQueue((q) => [...q, ...fresh]);
    done('ready', mine.value, list.value, bows);
  }, [userId, today]);

  // Loads on sign-in, and listens for changes while signed in.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), RELOAD_AFTER_MS);
    };
    void refresh();

    // Back from the background: anything could have happened meanwhile.
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') soon();
    });

    // Realtime passes on changes to rows this learner can read (the server's row-level security
    // decides): requests they sent or got, and their friends' summaries. Not removals: Realtime
    // can't keep those private, so they show up on the next load instead.
    const client = supabase;
    const channel = client
      ?.channel(`friends:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships', filter: `addressee=eq.${userId}` }, soon)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'friendships', filter: `addressee=eq.${userId}` }, soon)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'friendships', filter: `requester=eq.${userId}` }, soon)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'summaries', filter: `user_id=neq.${userId}` }, soon)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'summaries', filter: `user_id=neq.${userId}` }, soon)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bows', filter: `bowed_to=eq.${userId}` }, soon)
      .subscribe();

    return () => {
      clearTimeout(timer);
      app.remove();
      if (client && channel) void client.removeChannel(channel);
    };
  }, [userId, refresh]);

  // Chooses a name the first time (with a new friend code), or changes it. Returns an error
  // message, or null.
  async function saveName(text: string): Promise<string | null> {
    if (!userId) return 'Sign in first.';
    const name = normalizeName(text);
    if (!isValidName(name)) return 'Names are 1 to 20 characters.';
    if (loaded?.profile) {
      const result = await renameProfile(userId, name);
      if (!result.ok) return "Couldn't save that. Check your connection.";
    } else {
      let created = false;
      for (let i = 0; i < CODE_TRIES && !created; i++) {
        const result = await createProfile(userId, name, makeFriendCode(Math.random));
        if (!result.ok) return "Couldn't save that. Check your connection.";
        created = result.value === 'created';
      }
      if (!created) return 'Something went wrong. Try again.';
      // Share straight away, so friends see a belt before the next lesson.
      await uploadSummary(userId, summary);
    }
    await refresh();
    return null;
  }

  // Adds a friend by their code. Returns what happened, to show.
  async function add(text: string): Promise<string> {
    if (!isFriendCode(text)) return 'Friend codes are 6 letters and numbers, like 7Q4-MKX.';
    const result = await requestFriend(normalizeFriendCode(text));
    if (!result.ok) return "Couldn't reach the dojo. Check your connection.";
    const { outcome, name } = result.value;
    await refresh();
    switch (outcome) {
      case 'sent':
        return `Request sent to ${name ?? 'them'}. You'll be friends once they accept.`;
      case 'accepted':
        return `You and ${name ?? 'they'} are now friends.`;
      case 'already':
        return `You've already added ${name ?? 'them'}.`;
      case 'self':
        return "That's your own code.";
      case 'no-profile':
        return 'Choose your name first.';
      case 'not-found':
        return 'Nobody has that code. Check it and try again.';
    }
  }

  async function accept(other: string) {
    await acceptFriend(other);
    await refresh();
  }

  async function remove(other: string) {
    if (!userId) return;
    await removeLink(userId, other);
    await refresh();
  }

  async function bow(other: string): Promise<BowOutcome> {
    if (!userId) return 'error';
    const outcome = await bowTo(userId, other, today);
    await refresh();
    return outcome;
  }

  function seeBows() {
    void markBowsSeen().then(refresh);
  }

  // What's shown belongs to whoever is signed in now: another account's list never shows.
  const current = userId && loaded?.userId === userId ? loaded : null;
  const friends = current?.friends ?? [];
  const bows = current?.bows ?? NO_BOWS;
  // Bows from someone who's no longer a friend aren't shown.
  const names = new Map(friends.map((f) => [f.userId, f.name]));
  const value: FriendsValue = {
    status: !userId ? 'signed-out' : (current?.status ?? 'loading'),
    profile: current?.profile ?? null,
    friends,
    waiting: waitingRequests(friends),
    news: userId ? (queue[0] ?? null) : null,
    dismissNews: () => setQueue((q) => q.slice(1)),
    refresh,
    saveName,
    add,
    accept,
    remove,
    bowedToday: bows.given,
    bowers: bows.unseen.flatMap((id) => names.get(id) ?? []),
    bow,
    seeBows,
  };
  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
}

export function useFriends(): FriendsValue {
  const value = useContext(FriendsContext);
  if (!value) throw new Error('useFriends must be used inside FriendsProvider');
  return value;
}
