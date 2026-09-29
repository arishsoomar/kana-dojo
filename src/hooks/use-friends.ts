import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { isFriendCode, isValidName, makeFriendCode, normalizeFriendCode, normalizeName } from '@/core/friends';
import {
  acceptFriend,
  createProfile,
  loadFriends,
  loadProfile,
  removeLink,
  renameProfile,
  requestFriend,
  type Friend,
  type Profile,
} from '@/storage/friends';

import { useAuth } from './use-auth';

// Where the friends screen stands: signed out, loading, the server's friend tables missing,
// the server unreachable, no name chosen yet, or ready.
export type FriendsStatus = 'signed-out' | 'loading' | 'missing' | 'error' | 'no-profile' | 'ready';

// Tries at a friend code that isn't taken, before giving up.
const CODE_TRIES = 5;

// The learner's profile and friends, loaded whenever the screen comes into view.
export function useFriends() {
  const { userId } = useAuth();
  const [status, setStatus] = useState<FriendsStatus>(userId ? 'loading' : 'signed-out');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setStatus('signed-out');
      return;
    }
    const mine = await loadProfile(userId);
    if (!mine.ok) {
      setStatus(mine.error.missing ? 'missing' : 'error');
      return;
    }
    setProfile(mine.value);
    if (!mine.value) {
      setStatus('no-profile');
      return;
    }
    const list = await loadFriends(userId);
    if (!list.ok) {
      setStatus(list.error.missing ? 'missing' : 'error');
      return;
    }
    setFriends(list.value);
    setStatus('ready');
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  // Chooses a name the first time (with a new friend code), or changes it. Returns an error
  // message, or null.
  async function saveName(text: string): Promise<string | null> {
    if (!userId) return 'Sign in first.';
    const name = normalizeName(text);
    if (!isValidName(name)) return 'Names are 1 to 20 characters.';
    if (profile) {
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

  return { status, profile, friends, refresh, saveName, add, accept, remove };
}
