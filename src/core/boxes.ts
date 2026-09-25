const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// How long a kana waits before it is due again, indexed by box (0–7).
// White belt (boxes 0–2) has no wait: reaching green takes right answers, not time.
// From green up, the waits make a belt mean the kana is remembered after a break.
const INTERVALS: readonly number[] = [
  0,
  0,
  0,
  20 * MINUTE,
  6 * HOUR,
  2 * DAY,
  7 * DAY,
  21 * DAY,
];

export const MAX_BOX = INTERVALS.length - 1;

export function intervalFor(box: number): number {
  const clamped = Math.min(Math.max(box, 0), MAX_BOX);
  // Safe: clamped is always a valid index into INTERVALS.
  return INTERVALS[clamped]!;
}

// Belts from lowest to highest.
export const BELTS = ['white', 'green', 'brown', 'black'] as const;

export type Belt = (typeof BELTS)[number];

export function tierOf(box: number): Belt {
  if (box >= 7) return 'black';
  if (box >= 5) return 'brown';
  if (box >= 3) return 'green';
  return 'white';
}

// The learner's progress on one kana.
export type KanaProgress = {
  box: number;
  // Timestamp in milliseconds (like Date.now()) when the kana is next due.
  dueAt: number;
};

export function isDue(progress: KanaProgress, now: number): boolean {
  return now >= progress.dueAt;
}
