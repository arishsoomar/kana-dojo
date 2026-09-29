import { useMemo } from 'react';

import { assignmentsDone, assignmentsOn, monthChallenge, moonsEarned } from '@/core/assignments';

import { useProgress } from './use-progress';
import { localDay, useHoursLeft, useToday } from './use-today';

// The day of each finished lesson and game, in the device's timezone, worked out once per change.
export function useFinishedDays(): string[] {
  const { progress } = useProgress();
  return useMemo(() => progress.completed.map((c) => localDay(c.at)), [progress.completed]);
}

// Today's assignments, this month's challenge, moons earned, and the hours left today.
export function useAssignments() {
  const { progress } = useProgress();
  const days = useFinishedDays();
  const today = useToday();
  const hoursLeft = useHoursLeft();
  const month = today.slice(0, 7);
  return useMemo(
    () => ({
      today: assignmentsOn(progress, days, today),
      month: { ...monthChallenge(progress, days, month), name: monthName(month) },
      moons: moonsEarned(progress, days),
      hoursLeft,
    }),
    [progress, days, today, month, hoursLeft],
  );
}

// How many assignments have ever been done, for mon.
export function useAssignmentsDone(): number {
  const { progress } = useProgress();
  const days = useFinishedDays();
  return useMemo(() => assignmentsDone(progress, days), [progress, days]);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function monthName(month: string): string {
  return MONTHS[Number(month.slice(5, 7)) - 1] ?? '';
}
