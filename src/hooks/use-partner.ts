import { useEffect } from 'react';

import { friendToday } from '@/core/friends';
import { choosePartner, completePartner, partnerGoal, partnerOn, type PartnerGoal, type TheirDay } from '@/core/partner';
import type { Friend } from '@/storage/friends';

import { useFinishedDays } from './use-assignments';
import { useAuth } from './use-auth';
import { useFriends } from './use-friends';
import { useProgress } from './use-progress';
import { useToday } from './use-today';

const NOTHING_YET: TheirDay = { xp: 0, lessons: 0, kata: false };

// Today's partner assignment: the friends to choose from, the one chosen (it holds for the
// day), and the shared goal with them. When the two of you reach it, it's recorded in your
// progress, so its mon stays after the day ends.
export function usePartner() {
  const { userId } = useAuth();
  const { friends, profile } = useFriends();
  const { progress, changeProgress } = useProgress();
  const days = useFinishedDays();
  const today = useToday();

  const choices = friends.filter((f) => f.state === 'accepted');
  const chosen = partnerOn(progress, today);
  const partner: Friend | null = chosen ? (choices.find((f) => f.userId === chosen.friend) ?? null) : null;
  const goal: PartnerGoal | null =
    userId && partner
      ? partnerGoal(progress, days, today, userId, partner.userId, partner.summary ? friendToday(partner.summary, today) : NOTHING_YET)
      : null;

  // Reached together: record it, once.
  const reached = goal?.done === true && chosen !== null && !chosen.done;
  const partnerId = chosen?.friend ?? null;
  useEffect(() => {
    if (reached && partnerId) changeProgress((current) => completePartner(current, today, partnerId));
  }, [reached, partnerId, today, changeProgress]);

  function choose(friend: string) {
    changeProgress((current) => choosePartner(current, today, friend, Date.now()));
  }

  return {
    signedIn: userId !== null,
    myName: profile?.name ?? null,
    choices,
    chosen, // today's choice, even if they're no longer a friend
    partner, // the chosen friend, while still a friend
    goal,
    choose,
  };
}
