import { bestScore } from '@/core/answers';
import { scrolls } from '@/core/duel';
import { dungeonId } from '@/core/dungeon';
import { EXAM_PASS } from '@/core/exam';
import { FORGE_LESSON_ID } from '@/core/forge';
import type { Feats } from '@/core/gear';
import { monBalance } from '@/core/mon';

import { useProgress } from './use-progress';
import { useStreak } from './use-streak';
import { localDay } from './use-today';

// The learner's mon, and the feats that earn gear, worked out from their history.
export function useMon(): { balance: number; feats: Feats } {
  const { progress } = useProgress();
  const streak = useStreak();
  const trainedDays = progress.completed.map((c) => localDay(c.at));
  // Rows (in either script) with any belt exam passed, ever.
  const rowsPassed = new Set(
    progress.completed
      .filter((c) => c.lesson.startsWith('exam:') && (c.score ?? 0) >= EXAM_PASS)
      .map((c) => c.lesson.split(':').slice(1, 3).join(':')),
  );
  const feats: Feats = {
    deepestFloor: Math.max(bestScore(progress, dungeonId('hiragana')) ?? 0, bestScore(progress, dungeonId('katakana')) ?? 0),
    duelsWon: scrolls(progress).filter((s) => s.state === 'won').length,
    longestStreak: streak.best,
    rowBelts: rowsPassed.size,
    wordsRead: progress.completed.filter((c) => c.lesson === FORGE_LESSON_ID).reduce((sum, c) => sum + (c.score ?? 0), 0),
  };
  return { balance: monBalance(progress, trainedDays), feats };
}
