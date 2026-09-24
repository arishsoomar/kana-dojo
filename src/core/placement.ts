import { completeLesson, NEW_KANA, type Progress } from './answers';
import { intervalFor } from './boxes';
import { KANA, type Kana, type RowId } from './kana';
import { plaquesFor } from './path';
import { shuffle, type Rng } from './random';

// The grading test for learners who already know some hiragana. It goes row by row,
// asking each kana once, and stops at the first row they mostly miss. Kana answered
// correctly and quickly start at green belt, which is what unlocks their rows.

// A row needs this share right to count as known: the same bar as unlocking the next row.
const KNOWN_SHARE = 0.8;
// Known kana start here: the lowest green-belt box.
const KNOWN_BOX = 3;

export function placementQuestions(row: RowId, rng: Rng): Kana[] {
  return shuffle(
    KANA.filter((k) => k.script === 'hiragana' && k.row === row),
    rng,
  );
}

export function rowPassed(correct: number, total: number): boolean {
  return total > 0 && correct / total >= KNOWN_SHARE;
}

// Starts a known kana at green belt. A kana that's already higher is left alone.
export function placeKnown(progress: Progress, char: string, now: number): Progress {
  const current = progress.kana[char] ?? NEW_KANA;
  if (current.box >= KNOWN_BOX) return progress;
  return { ...progress, kana: { ...progress.kana, [char]: { box: KNOWN_BOX, dueAt: now + intervalFor(KNOWN_BOX) } } };
}

// Marks a known row's lesson plaques as done, so the learn path starts after it.
export function placeRow(progress: Progress, row: RowId, now: number): Progress {
  return plaquesFor('hiragana', row).reduce((p, plaque) => completeLesson(p, plaque.id, now), progress);
}
