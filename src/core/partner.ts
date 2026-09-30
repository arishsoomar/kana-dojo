import type { Completion, Partnering, Progress } from './answers';
import { WORDS_REVIEW_ID } from './deck';
import { kataId } from './kata';
import { seededRng } from './random';

// Partner assignments: a daily goal shared with one friend, on top of the day's three. Its
// progress adds your day to your partner's (from their summary). Which goal it is comes from a
// seed made from the date and the pair, so both of you see the same one. Finishing it earns
// mon, recorded on each side once it's done, so it still counts after the day ends. It isn't
// training: a partner can finish a shared goal alone, so it never counts toward a streak.

export type PartnerKind = 'xp' | 'lessons' | 'kata';

// What the two of you need between you.
export const PARTNER_TARGETS: Readonly<Record<PartnerKind, number>> = {
  xp: 500, // XP from lessons
  lessons: 6, // lessons finished
  kata: 2, // both of you play the daily kata
};

const KINDS: readonly PartnerKind[] = ['xp', 'lessons', 'kata'];

// A friend's training today, going by their summary (see friendToday).
export type TheirDay = { xp: number; lessons: number; kata: boolean };

export type PartnerGoal = {
  kind: PartnerKind;
  friend: string;
  mine: number; // your part
  theirs: number; // their part
  count: number; // the two together, never past the target
  target: number;
  done: boolean;
};

const isGame = (c: Completion) => c.lesson.startsWith('game:');
// Lessons: plaques, practice and drills. Not games, exams or duels.
// Not word reviews either: their score is cards reviewed, not XP.
const isLesson = (c: Completion) =>
  !isGame(c) && !c.lesson.startsWith('exam:') && !c.lesson.startsWith('duel:') && !c.lesson.startsWith(WORDS_REVIEW_ID);

// The day's goal for a pair. The two ids are sorted first, so it's the same from both sides.
export function partnerKind(day: string, me: string, friend: string): PartnerKind {
  const pair = [me, friend].sort().join(':');
  const rng = seededRng(`partner:${day}:${pair}`);
  // Safe: the index is within KINDS.
  return KINDS[Math.floor(rng() * KINDS.length)]!;
}

// The partner chosen for a day, or null. If two devices chose different friends that day,
// the first choice holds.
export function partnerOn(progress: Progress, day: string): Partnering | null {
  const that = progress.partners.filter((p) => p.day === day);
  return that.reduce<Partnering | null>((first, p) => (first === null || p.at < first.at ? p : first), null);
}

// Chooses a friend for the day's shared goal. Once chosen, it holds for the day.
export function choosePartner(progress: Progress, day: string, friend: string, now: number): Progress {
  if (partnerOn(progress, day)) return progress;
  return { ...progress, partners: [...progress.partners, { day, friend, at: now, done: false }] };
}

// The shared goal with a friend on a day: your part from your finished lessons that day,
// theirs from their summary. `days` gives the day of each of `progress.completed`.
export function partnerGoal(progress: Progress, days: readonly string[], day: string, me: string, friend: string, theirs: TheirDay): PartnerGoal {
  const kind = partnerKind(day, me, friend);
  const today = progress.completed.filter((_, i) => days[i] === day);
  const lessons = today.filter(isLesson);
  const [mine, theirPart] =
    kind === 'xp'
      ? [lessons.reduce((sum, c) => sum + (c.score ?? 0), 0), theirs.xp]
      : kind === 'lessons'
        ? [lessons.length, theirs.lessons]
        : [today.some((c) => c.lesson === kataId(day)) ? 1 : 0, theirs.kata ? 1 : 0];
  const target = PARTNER_TARGETS[kind];
  const count = Math.min(mine + theirPart, target);
  const recorded = progress.partners.some((p) => p.day === day && p.friend === friend && p.done);
  return { kind, friend, mine, theirs: theirPart, count, target, done: recorded || count >= target };
}

// Records the day's shared goal as finished. Only for the partner chosen that day, and once.
export function completePartner(progress: Progress, day: string, friend: string): Progress {
  const chosen = partnerOn(progress, day);
  if (!chosen || chosen.friend !== friend || chosen.done) return progress;
  return { ...progress, partners: progress.partners.map((p) => (p === chosen ? { ...p, done: true } : p)) };
}

// Shared goals finished, ever. Each earns mon.
export function partnersDone(progress: Progress): number {
  return progress.partners.filter((p) => p.done).length;
}
