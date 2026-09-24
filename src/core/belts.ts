import { NEW_KANA, type Progress } from './answers';
import { BELTS, tierOf, type Belt } from './boxes';
import { KANA, type RowId, type Script } from './kana';

// The belt a row qualifies for: its weakest kana's belt. (A row's belt is only awarded
// by passing a belt exam; see exam.ts.)
export function rowBelt(progress: Progress, script: Script, row: RowId): Belt {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const lowest = Math.min(...rowKana.map((k) => BELTS.indexOf(tierOf((progress.kana[k.char] ?? NEW_KANA).box))));
  // Safe: every index came from BELTS.indexOf on a real belt.
  return BELTS[lowest]!;
}
