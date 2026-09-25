import type { Progress } from './answers';
import { tierOf } from './boxes';
import { KANA, ROWS, type Kana, type RowId, type Script } from './kana';

// Share of a row that must be green belt or better to open the next row.
const UNLOCK_SHARE = 0.8;

function isGreenOrBetter(progress: Progress, kana: Kana): boolean {
  const box = progress.kana[kana.char]?.box ?? 0;
  return tierOf(box) !== 'white';
}

export function unlockedKana(progress: Progress, script: Script): Kana[] {
  const unlocked: Kana[] = [];

  for (const row of ROWS) {
    const rowKana = KANA.filter((k) => k.script === script && k.row === row);
    unlocked.push(...rowKana);

    const green = rowKana.filter((k) => isGreenOrBetter(progress, k)).length;
    if (green / rowKana.length < UNLOCK_SHARE) break;
  }

  return unlocked;
}

// How many more kana in `row` must reach green belt before the next row opens (0 if none).
export function greenNeeded(progress: Progress, script: Script, row: RowId): number {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const green = rowKana.filter((k) => isGreenOrBetter(progress, k)).length;
  return Math.max(Math.ceil(rowKana.length * UNLOCK_SHARE) - green, 0);
}

// The unlocked kana the learner has met: answered at least once, or placed by the placement
// test. When a row opens, its kana stay out of practice until a plaque teaches them.
export function metKana(progress: Progress, script: Script): Kana[] {
  return unlockedKana(progress, script).filter((k) => progress.kana[k.char] !== undefined);
}
