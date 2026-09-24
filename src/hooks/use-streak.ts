import { useState } from 'react';

import { streakOf, type Streak } from '@/core/streak';

import { useProgress } from './use-progress';

// A timestamp as a calendar date ("YYYY-MM-DD") in the device's own timezone.
function localDay(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// The learner's streak, from the lessons they've finished.
export function useStreak(): Streak {
  const { progress } = useProgress();
  // Today is read once, when the screen first appears; reading the clock during every
  // render isn't allowed.
  const [today] = useState(() => localDay(Date.now()));
  return streakOf(
    progress.completed.map((c) => localDay(c.at)),
    today,
  );
}
