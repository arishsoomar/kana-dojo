import { streakOf, type Streak } from '@/core/streak';

import { useProgress } from './use-progress';
import { localDay, useToday } from './use-today';

// The learner's streak, from the lessons they've finished.
export function useStreak(): Streak {
  const { progress } = useProgress();
  const today = useToday();
  return streakOf(
    progress.completed.map((c) => localDay(c.at)),
    today,
  );
}
