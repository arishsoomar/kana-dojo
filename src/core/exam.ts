import type { Progress } from './answers';
import { BELTS, type Belt } from './boxes';
import { KANA, type Kana, type RowId, type Script } from './kana';
import { rowBelt } from './belts';
import { shuffle, type Rng } from './random';

// Belt exams. A row qualifies for a belt when all its kana reach it (see rowBelt), but the
// belt is only awarded by passing a timed exam on that row. Exam results are stored with the
// finished-lesson records, under examId, with the number correct as the score.

export const EXAM_LENGTH = 20;
export const EXAM_PASS = 18;
export const EXAM_TIME_MS = 60_000;
const MAX_MISSES = EXAM_LENGTH - EXAM_PASS;

export function examId(script: Script, row: RowId, belt: Belt): string {
  return `exam:${script}:${row}:${belt}`;
}

// The position in BELTS of the highest exam passed for a row (0, white, if none).
function highestPassed(progress: Progress, script: Script, row: RowId): number {
  let highest = 0;
  BELTS.forEach((belt, index) => {
    const id = examId(script, row, belt);
    const passed = progress.completed.some((c) => c.lesson === id && (c.score ?? 0) >= EXAM_PASS);
    if (passed) highest = Math.max(highest, index);
  });
  return highest;
}

// The belt a row shows: the highest exam passed, but never above what its kana are now.
export function awardedBelt(progress: Progress, script: Script, row: RowId): Belt {
  const qualified = BELTS.indexOf(rowBelt(progress, script, row));
  // Safe: both indexes are positions in BELTS.
  return BELTS[Math.min(highestPassed(progress, script, row), qualified)]!;
}

// The belt exam a row can take now, or null. It's for the belt the row qualifies for,
// when that's higher than any exam already passed.
export function examDue(progress: Progress, script: Script, row: RowId): Belt | null {
  const qualified = rowBelt(progress, script, row);
  return BELTS.indexOf(qualified) > highestPassed(progress, script, row) ? qualified : null;
}

// The exam's questions: the row's kana, repeated to fill the exam, in random order.
// It's built in rounds (each round is the whole row, shuffled), and a round never starts
// with the kana the last one ended on, so the same kana never comes twice in a row.
export function examQuestions(script: Script, row: RowId, rng: Rng): Kana[] {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const questions: Kana[] = [];
  while (questions.length < EXAM_LENGTH) {
    let round = shuffle(rowKana, rng);
    if (round.length > 1 && round[0] === questions[questions.length - 1]) {
      round = [...round.slice(1), ...round.slice(0, 1)];
    }
    questions.push(...round);
  }
  return questions.slice(0, EXAM_LENGTH);
}

export type ExamStatus = 'going' | 'passed' | 'failed';

// Where an exam stands. It ends as soon as the result is certain: at the third miss (the
// pass mark can no longer be reached), after the last question, or when time runs out.
export function examStatus({ correct, misses, timeUp }: { correct: number; misses: number; timeUp: boolean }): ExamStatus {
  if (misses > MAX_MISSES) return 'failed';
  if (timeUp || correct + misses >= EXAM_LENGTH) return correct >= EXAM_PASS ? 'passed' : 'failed';
  return 'going';
}
