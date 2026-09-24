import { NEW_KANA, type Progress } from './answers';
import { BELTS, tierOf, type Belt } from './boxes';
import { KANA, ROWS, type Kana, type RowId, type Script } from './kana';
import { rowBelt } from './path';
import { unlockedKana } from './unlock';

export type GridCell = {
  kana: Kana;
  belt: Belt;
  locked: boolean;
};

export type GridRow = {
  row: RowId;
  belt: Belt; // the row's belt: its weakest kana's belt
  cells: GridCell[];
};

export type MasteryGrid = {
  rows: GridRow[];
  total: number;
  pastWhite: number;
  counts: Record<Belt, number>;
};

// Every kana in a script, grouped by row, with its belt and whether it's unlocked yet.
export function masteryGrid(progress: Progress, script: Script): MasteryGrid {
  const unlocked = new Set(unlockedKana(progress, script));

  const rows = ROWS.map((row) => ({
    row,
    belt: rowBelt(progress, script, row),
    cells: KANA.filter((k) => k.script === script && k.row === row).map((kana) => ({
      kana,
      belt: tierOf((progress.kana[kana.char] ?? NEW_KANA).box),
      locked: !unlocked.has(kana),
    })),
  }));

  const cells = rows.flatMap((r) => r.cells);
  const counts = Object.fromEntries(BELTS.map((belt) => [belt, cells.filter((c) => c.belt === belt).length]));

  return {
    rows,
    total: cells.length,
    pastWhite: cells.filter((c) => c.belt !== 'white').length,
    counts: counts as Record<Belt, number>, // Safe: built from every entry in BELTS.
  };
}
