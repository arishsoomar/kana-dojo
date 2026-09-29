import { useEffect } from 'react';

import { friendSummary } from '@/core/friends';
import { uploadSummary } from '@/storage/friends';

import { useAssignments, useFinishedDays } from './use-assignments';
import { useAuth } from './use-auth';
import { useProgress } from './use-progress';
import { useStreak } from './use-streak';
import { useToday } from './use-today';

// Wait this long after the last change before sharing, so a lesson is one upload, not ten.
const SHARE_DELAY_MS = 5000;

// Shares the signed-in learner's summary with their friends: rank, streak, today's training
// and the dojo room. It draws nothing. Without a profile (no name chosen yet) the server turns
// the upload away, which is fine: there's nobody to share with.
export function FriendSync() {
  const { userId } = useAuth();
  const { progress } = useProgress();
  const days = useFinishedDays();
  const today = useToday();
  const streak = useStreak().current;
  const { moons } = useAssignments();

  useEffect(() => {
    if (!userId) return;
    const summary = friendSummary(progress, { days, today, streak, moons });
    const timer = setTimeout(() => void uploadSummary(userId, summary), SHARE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [userId, progress, days, today, streak, moons]);

  return null;
}
