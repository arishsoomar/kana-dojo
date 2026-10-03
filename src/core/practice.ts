import type { Progress } from './answers';
import { makeChoices } from './choices';
import type { RowId, Kana, Script } from './kana';
import { pickNext } from './pick';
import { avoiding, type Question } from './question';
import type { Rng } from './random';
import { unlockedKana } from './unlock';

// Free practice: as many questions as you like, from rows you choose, in either script or
// both. No exam and no end; answers count toward each kana's belt like a lesson's.

export type RowPick = { script: Script; row: RowId };

// The rows open in a script (those the Learn wall has unlocked), in order.
export function practiceRows(progress: Progress, script: Script): RowId[] {
  return [...new Set(unlockedKana(progress, script).map((k) => k.row))];
}

// The kana of the chosen rows, in each script's order. Rows that aren't open are left out.
export function practicePool(progress: Progress, picks: readonly RowPick[]): Kana[] {
  return (['hiragana', 'katakana'] as const).flatMap((script) =>
    unlockedKana(progress, script).filter((k) => picks.some((p) => p.script === script && p.row === k.row)),
  );
}

// A question from the chosen kana, the one due most going first (as in lessons), never the one
// just asked. Its wrong options come from the same script, or mixing scripts would give the
// answer away.
export function makePracticeQuestion(progress: Progress, pool: readonly Kana[], rng: Rng, avoid?: string): Question {
  const kana = pickNext(progress, avoiding(pool, avoid), rng);
  return { kana, choices: makeChoices(kana, unlockedKana(progress, kana.script), rng) };
}
