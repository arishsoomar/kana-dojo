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

// When the soonest kana in `row` that's still below green belt can next move up a box
// (a timestamp; 0 if one is due already), or null if the whole row is green or better.
// A right answer only moves a kana up when it's due, so this is when practice next pays off.
export function nextPromotionAt(progress: Progress, script: Script, row: RowId): number | null {
  const waiting = KANA.filter((k) => k.script === script && k.row === row && !isGreenOrBetter(progress, k));
  if (waiting.length === 0) return null;
  return Math.min(...waiting.map((k) => progress.kana[k.char]?.dueAt ?? 0));
}
