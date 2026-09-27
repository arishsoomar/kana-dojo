import { REST_DAY_ITEM } from '@/core/gear';
import { streakOf, type Streak } from '@/core/streak';

import { useProgress } from './use-progress';
import { localDay, useToday } from './use-today';

// The learner's streak, from the lessons they've finished and the rest days they've bought.
export function useStreak(): Streak {
  const { progress } = useProgress();
  const today = useToday();
  return streakOf(
    progress.completed.map((c) => localDay(c.at)),
    today,
    progress.purchases.filter((p) => p.item === REST_DAY_ITEM).map((p) => localDay(p.at)),
  );
}
