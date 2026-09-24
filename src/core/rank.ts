import type { Progress } from './answers';
import { BELTS, type Belt } from './boxes';
import { awardedBelt } from './exam';
import { ROWS, type Script } from './kana';

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

// How many rows (out of 20: 10 per script) need to have earned each belt, by exam,
// for the learner's overall rank to reach it. Black means every row in both scripts.
const ROWS_NEEDED: Record<Belt, number> = {
  white: 0,
  green: 3,
  brown: 10,
  black: SCRIPTS.length * ROWS.length,
};

// The learner's overall rank, which sets Karasu's form.
export function overallRank(progress: Progress): Belt {
  const earned = SCRIPTS.flatMap((script) => ROWS.map((row) => BELTS.indexOf(awardedBelt(progress, script, row))));
  let rank: Belt = 'white';
  BELTS.forEach((belt, index) => {
    // A row with a higher belt counts toward every lower rank too.
    const rows = earned.filter((e) => e >= index).length;
    if (rows >= ROWS_NEEDED[belt]) rank = belt;
  });
  return rank;
}
