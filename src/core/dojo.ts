import { bestScore, type Progress } from './answers';
import type { Belt } from './boxes';
import { scrolls } from './duel';
import { dungeonId } from './dungeon';
import { awardedBelt } from './exam';
import { KANA, rowsOf, type RowId, type Script } from './kana';
import { fewestMoves } from './memory';
import { taikoId } from './taiko';

// The learner's dojo: a room that fills with what they've earned. It's a picture of progress
// that already exists, so nothing here is stored. The streak and moons are worked out outside
// the engine (they need the device's timezone) and passed in.

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

export type RoomPlaque = { script: Script; row: RowId; kana: string; belt: Belt };
export type RackGame = 'rain' | 'dungeon' | 'taiko' | 'memory';
// A game's record: a best score, deepest floor or fewest moves. Null if it hasn't been played.
export type RackRecord = { game: RackGame; value: number | null };
// 0 a bare pot, 1 a sprout, 2 a young tree, 3 a full tree, 4 in blossom.
export type BonsaiStage = 0 | 1 | 2 | 3 | 4;

export type DojoRoom = {
  plaques: RoomPlaque[]; // rows with a belt earned by exam, hiragana first, in row order
  rowCount: number; // every row there is, in both scripts
  scroll: { kana: readonly [string, string]; name: string } | null; // the most recently won duel
  scrollsWon: number;
  rack: RackRecord[];
  bonsai: BonsaiStage;
  lanterns: number; // one per moon
};

// Streak days at which the bonsai grows: sprout, young tree, full tree, blossom.
const BONSAI_DAYS = [1, 7, 30, 100] as const;

export function bonsaiStage(streak: number): BonsaiStage {
  return BONSAI_DAYS.filter((days) => streak >= days).length as BonsaiStage;
}

// The better of a game's records over both scripts, or null.
function best(values: (number | null)[], pick: (...n: number[]) => number): number | null {
  const played = values.filter((v): v is number => v !== null);
  return played.length === 0 ? null : pick(...played);
}

export function dojoRoom(progress: Progress, { streak, moons }: { streak: number; moons: number }): DojoRoom {
  const plaques = SCRIPTS.flatMap((script) =>
    rowsOf(script).flatMap((row): RoomPlaque[] => {
      const belt = awardedBelt(progress, script, row);
      if (belt === 'white') return [];
      const kana = KANA.filter((k) => k.script === script && k.row === row).map((k) => k.char).join('');
      return [{ script, row, kana, belt }];
    }),
  );

  const won = scrolls(progress).filter((s) => s.firstWin !== null);
  const latest = won.reduce<(typeof won)[number] | null>(
    (last, s) => (last === null || (s.firstWin?.at ?? 0) > (last.firstWin?.at ?? 0) ? s : last),
    null,
  );

  const perScript = (id: (script: Script) => string) => SCRIPTS.map((script) => bestScore(progress, id(script)));
  const rack: RackRecord[] = [
    { game: 'rain', value: bestScore(progress, 'game:rain') },
    { game: 'dungeon', value: best(perScript(dungeonId), Math.max) },
    { game: 'taiko', value: best(perScript(taikoId), Math.max) },
    { game: 'memory', value: best((['hiragana', 'katakana', 'both'] as const).map((mode) => fewestMoves(progress, mode)), Math.min) },
  ];

  return {
    plaques,
    rowCount: SCRIPTS.reduce((sum, script) => sum + rowsOf(script).length, 0),
    scroll: latest ? { kana: latest.pair.kana, name: latest.pair.name } : null,
    scrollsWon: won.length,
    rack,
    bonsai: bonsaiStage(streak),
    lanterns: moons,
  };
}
