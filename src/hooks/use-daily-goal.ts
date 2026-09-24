import { lessonsOn } from '@/core/goal';

import { useProgress } from './use-progress';
import { localDay, useToday } from './use-today';

// Today's lessons against the daily goal.
export function useDailyGoal(): { goal: number; done: number } {
  const { progress } = useProgress();
  const today = useToday();
  return {
    goal: progress.settings.dailyGoal,
    done: lessonsOn(
      progress.completed.map((c) => localDay(c.at)),
      today,
    ),
  };
}
