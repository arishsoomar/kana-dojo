import type { Progress } from './answers';
import { tierOf } from './boxes';
import { KANA, ROWS, type Kana, type Script } from './kana';

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
