import type { Completion, Progress } from './answers';
import { WORDS_REVIEW_ID } from './deck';
import { seededRng, shuffle } from './random';

// Assignments: three small tasks a day that point the learner at useful practice, and a
// monthly challenge on top. Nothing about them is stored. Each day's list is chosen by a seed
// made from the date, and whether each is done is worked out from that day's finished lessons
// and games, so they sync with everything else. Days are "YYYY-MM-DD" in the learner's own
// timezone; `days` gives the day of each of `progress.completed`, worked out outside the engine.

export const ASSIGNMENTS_PER_DAY = 3;
// The first day with assignments, so history from before them doesn't pay out.
export const ASSIGNMENTS_FROM = '2026-09-28';
// Assignments done in a calendar month to earn its moon.
export const MONTH_GOAL = 30;

export type AssignmentKind =
  | 'lessons'
  | 'xp'
  | 'games'
  | 'rain'
  | 'dungeon'
  | 'memory'
  | 'taiko'
  | 'calligraphy'
  | 'forge'
  | 'kata'
  | 'mixups'
  | 'reviews';

export type Assignment = {
  kind: AssignmentKind;
  title: string;
  count: number; // progress so far, never past the target
  target: number;
  done: boolean;
};

const isGame = (c: Completion) => c.lesson.startsWith('game:');
const isMixUp = (c: Completion) => c.lesson.startsWith('drill:') || c.lesson.startsWith('duel:');
// Lessons: plaques, practice and drills. Not games, exams, duels, or word reviews (whose
// score is cards reviewed, not XP).
const isLesson = (c: Completion) =>
  !isGame(c) && !c.lesson.startsWith('exam:') && !c.lesson.startsWith('duel:') && !c.lesson.startsWith(WORDS_REVIEW_ID);
const startsWith = (prefix: string) => (c: Completion) => c.lesson === prefix || c.lesson.startsWith(`${prefix}:`);

type Rule = {
  title: string;
  target: number;
  // Progress from the day's finished lessons and games.
  progress: (today: readonly Completion[]) => number;
  // Whether it can be set, from the days before. Undefined: it always can.
  opensAfter?: (c: Completion) => boolean;
};

const howMany = (test: (c: Completion) => boolean) => (today: readonly Completion[]) => today.filter(test).length;
const total = (test: (c: Completion) => boolean) => (today: readonly Completion[]) =>
  today.filter(test).reduce((sum, c) => sum + (c.score ?? 0), 0);

// The first three need no history; the rest open once the learner has done that thing before.
const CORE: readonly AssignmentKind[] = ['lessons', 'xp', 'games'];

const RULES: Readonly<Record<AssignmentKind, Rule>> = {
  lessons: { title: 'Finish 3 lessons', target: 3, progress: howMany(isLesson) },
  xp: { title: 'Earn 200 XP in lessons', target: 200, progress: total(isLesson) },
  games: { title: 'Play 2 games', target: 2, progress: howMany(isGame) },
  rain: { title: 'Play Kana Rain twice', target: 2, progress: howMany(startsWith('game:rain')), opensAfter: startsWith('game:rain') },
  dungeon: {
    title: 'Reach floor 3 in the dungeon',
    target: 3,
    progress: (today) => Math.max(0, ...today.filter(startsWith('game:dungeon')).map((c) => c.score ?? 0)),
    opensAfter: startsWith('game:dungeon'),
  },
  memory: { title: 'Clear a memory match board', target: 1, progress: howMany(startsWith('game:memory')), opensAfter: startsWith('game:memory') },
  taiko: { title: 'Finish a Taiko drill', target: 1, progress: howMany(startsWith('game:taiko')), opensAfter: startsWith('game:taiko') },
  calligraphy: {
    title: 'Write a round of calligraphy',
    target: 1,
    progress: howMany(startsWith('game:calligraphy')),
    opensAfter: startsWith('game:calligraphy'),
  },
  forge: { title: 'Read 10 words in Word Forge', target: 10, progress: total(startsWith('game:forge')), opensAfter: startsWith('game:forge') },
  kata: { title: 'Play the daily kata', target: 1, progress: howMany(startsWith('game:kata')), opensAfter: startsWith('game:kata') },
  mixups: { title: 'Settle 2 mix-ups', target: 2, progress: howMany(isMixUp), opensAfter: isMixUp },
  reviews: { title: 'Review 20 words', target: 20, progress: total(startsWith(WORDS_REVIEW_ID)), opensAfter: startsWith(WORDS_REVIEW_ID) },
};

const KINDS = Object.keys(RULES) as AssignmentKind[];

// The day's assignments, with their progress. None before ASSIGNMENTS_FROM.
export function assignmentsOn(progress: Progress, days: readonly string[], day: string): Assignment[] {
  if (day < ASSIGNMENTS_FROM) return [];
  const earlier = progress.completed.filter((_, i) => (days[i] ?? '') < day);
  const today = progress.completed.filter((_, i) => days[i] === day);

  // One of the core three, two of the rest that are open, and core ones to fill any gap.
  const rng = seededRng(`assignments:${day}`);
  const core = shuffle(CORE, rng);
  const open = KINDS.filter((k) => !CORE.includes(k) && earlier.some((c) => RULES[k].opensAfter?.(c)));
  const extras = shuffle(open, rng).slice(0, ASSIGNMENTS_PER_DAY - 1);
  const chosen = [...core.slice(0, 1), ...extras, ...core.slice(1)].slice(0, ASSIGNMENTS_PER_DAY);

  return chosen.map((kind) => {
    const rule = RULES[kind];
    const count = Math.min(rule.progress(today), rule.target);
    return { kind, title: rule.title, count, target: rule.target, done: count >= rule.target };
  });
}

// Every day with anything finished on it, from ASSIGNMENTS_FROM, and how many assignments
// were done that day.
function doneByDay(progress: Progress, days: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const day of new Set(days)) {
    if (day < ASSIGNMENTS_FROM) continue;
    counts.set(day, assignmentsOn(progress, days, day).filter((a) => a.done).length);
  }
  return counts;
}

// Assignments done, ever. Each earns mon.
export function assignmentsDone(progress: Progress, days: readonly string[]): number {
  return [...doneByDay(progress, days).values()].reduce((sum, n) => sum + n, 0);
}

// The monthly challenge for a month ("YYYY-MM"): assignments done in it, against the goal.
export function monthChallenge(progress: Progress, days: readonly string[], month: string): { done: number; goal: number } {
  let done = 0;
  for (const [day, n] of doneByDay(progress, days)) if (day.startsWith(`${month}-`)) done += n;
  return { done, goal: MONTH_GOAL };
}

// Months whose challenge was met: one moon each.
export function moonsEarned(progress: Progress, days: readonly string[]): number {
  const byMonth = new Map<string, number>();
  for (const [day, n] of doneByDay(progress, days)) byMonth.set(day.slice(0, 7), (byMonth.get(day.slice(0, 7)) ?? 0) + n);
  return [...byMonth.values()].filter((n) => n >= MONTH_GOAL).length;
}
