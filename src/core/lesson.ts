import { FAST_MS, NEW_KANA, type Progress } from './answers';
import { BELTS, tierOf, type Belt } from './boxes';
import type { RowId, Script } from './kana';
import { unlockedKana } from './unlock';

export const LESSON_LENGTH = 10;

const XP_PER_CORRECT = 10;
const XP_FAST_BONUS = 5;

export type LessonAnswer = {
  char: string;
  correct: boolean;
  ms: number;
};

export type LessonSummary = {
  xp: number;
  accuracy: number; // 0 to 1
  strikeSpeedMs: number | null; // null when nothing was answered correctly
  promotions: { char: string; belt: Belt }[];
  rowsOpened: { script: Script; row: RowId }[]; // rows that opened during the lesson
};

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

// The rows open after that weren't open before, in both scripts.
function openedRows(before: Progress, after: Progress): { script: Script; row: RowId }[] {
  return SCRIPTS.flatMap((script) => {
    const wasOpen = new Set(unlockedKana(before, script).map((k) => k.row));
    const nowOpen = [...new Set(unlockedKana(after, script).map((k) => k.row))];
    return nowOpen.filter((row) => !wasOpen.has(row)).map((row) => ({ script, row }));
  });
}

// The middle value of a list of numbers, or null if the list is empty.
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  // Safe: middle and middle - 1 are valid indexes (checked non-empty above).
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function beltIndex(progress: Progress, char: string): number {
  return BELTS.indexOf(tierOf((progress.kana[char] ?? NEW_KANA).box));
}

// What a finished lesson achieved. XP only comes from correct answers, never from time spent.
export function summarizeLesson(before: Progress, after: Progress, answers: readonly LessonAnswer[]): LessonSummary {
  const correct = answers.filter((a) => a.correct);
  const xp = correct.reduce((sum, a) => sum + XP_PER_CORRECT + (a.ms < FAST_MS ? XP_FAST_BONUS : 0), 0);

  const answeredChars = [...new Set(answers.map((a) => a.char))];
  const promotions = answeredChars
    .filter((char) => beltIndex(after, char) > beltIndex(before, char))
    .map((char) => ({ char, belt: tierOf((after.kana[char] ?? NEW_KANA).box) }));

  return {
    xp,
    accuracy: answers.length === 0 ? 0 : correct.length / answers.length,
    strikeSpeedMs: median(correct.map((a) => a.ms)),
    promotions,
    rowsOpened: openedRows(before, after),
  };
}
