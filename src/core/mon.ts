import type { Progress } from './answers';
import { DUEL_WIN } from './duel';
import { EXAM_PASS } from './exam';
import { gearById, REST_DAY_ITEM, REST_DAY_PRICE } from './gear';

// Mon, the old square-holed coin: earned by training and spent in the supply shed. They're
// never stored: what's been earned is worked out from the learner's history, and the balance
// is that less what's been spent. They can't be bought with money.

// What each thing earns.
export const MON = {
  lesson: 10, // any lesson: a plaque, practice or a drill
  game: 10, // a game of Kana Rain, Word Forge, the dungeon or memory match
  duel: 10, // any duel...
  duelWin: 20, // ...and this much more for winning it
  exam: 50, // a belt exam passed
  day: 20, // each day with any training
} as const;

// Everything earned so far. `trainedDays` are the days with any training, as "YYYY-MM-DD" in
// the learner's own timezone (worked out outside the engine, like the streak's).
export function monEarned(progress: Progress, trainedDays: readonly string[]): number {
  const fromRecords = progress.completed.reduce((sum, { lesson, score, opponent }) => {
    if (lesson.startsWith('exam:')) return sum + ((score ?? 0) >= EXAM_PASS ? MON.exam : 0);
    if (lesson.startsWith('duel:')) {
      const won = (score ?? 0) >= DUEL_WIN && (opponent ?? 0) < (score ?? 0);
      return sum + MON.duel + (won ? MON.duelWin : 0);
    }
    if (lesson.startsWith('game:')) return sum + MON.game;
    return sum + MON.lesson;
  }, 0);
  return fromRecords + new Set(trainedDays).size * MON.day;
}

// What an item costs: a rest day, or a piece of gear (0 for anything unknown).
export function priceOf(item: string): number {
  if (item === REST_DAY_ITEM) return REST_DAY_PRICE;
  return gearById(item)?.price ?? 0;
}

// Everything spent so far.
export function monSpent(progress: Progress): number {
  return progress.purchases.reduce((sum, p) => sum + priceOf(p.item), 0);
}

export function monBalance(progress: Progress, trainedDays: readonly string[]): number {
  return monEarned(progress, trainedDays) - monSpent(progress);
}
