import type { Progress } from './answers';
import type { Belt } from './boxes';
import { makeChoices } from './choices';
import { awardedBelt, examDue } from './exam';
import { KANA, ROWS, type Kana, type RowId, type Script } from './kana';
import { pickNext } from './pick';
import { avoiding, type Question } from './question';
import type { Rng } from './random';
import { unlockedKana } from './unlock';

// One lesson on the dojo wall. 'learn' plaques introduce a few kana; the 'mixed'
// plaque at the end of each row reviews the whole row.
export type Plaque = {
  id: string; // e.g. "hiragana:ka:0" or "hiragana:ka:mixed"
  script: Script;
  row: RowId;
  kind: 'learn' | 'mixed';
  kana: Kana[];
};

export type PlaqueState = 'done' | 'current' | 'locked';

export type PathUnit = {
  row: RowId;
  number: number; // 1 for the a row, 2 for ka, ...
  open: boolean; // the row is unlocked
  belt: Belt; // the row's awarded belt (from exams)
  exam: Belt | null; // a belt exam the row can take now, if any
  plaques: { plaque: Plaque; state: PlaqueState }[];
  done: number;
};

export type LearnPath = {
  units: PathUnit[];
  current: Plaque | null; // null when every open plaque is done
  currentUnit: PathUnit; // the unit with the current plaque, or the last open one
};

// How many new kana each 'learn' plaque introduces.
const KANA_PER_PLAQUE = 2;

export function plaquesFor(script: Script, row: RowId): Plaque[] {
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const learn: Plaque[] = [];
  for (let i = 0; i < rowKana.length; i += KANA_PER_PLAQUE) {
    const number = i / KANA_PER_PLAQUE;
    learn.push({ id: `${script}:${row}:${number}`, script, row, kind: 'learn', kana: rowKana.slice(i, i + KANA_PER_PLAQUE) });
  }
  return [...learn, { id: `${script}:${row}:mixed`, script, row, kind: 'mixed', kana: rowKana }];
}

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

// The plaque with this id, or null if there isn't one.
export function plaqueById(id: string): Plaque | null {
  for (const script of SCRIPTS) {
    for (const row of ROWS) {
      const plaque = plaquesFor(script, row).find((p) => p.id === id);
      if (plaque) return plaque;
    }
  }
  return null;
}

// The whole path for a script: every row's plaques, which are done, and which one is next.
// Plaques open one at a time, in order, and only in unlocked rows.
export function learnPath(progress: Progress, script: Script): LearnPath {
  const openRows = new Set(unlockedKana(progress, script).map((k) => k.row));
  const finished = new Set(progress.completed.map((c) => c.lesson));
  let current: Plaque | null = null;
  let currentUnit: PathUnit | null = null;
  let lastOpen: PathUnit | null = null;

  const units = ROWS.map((row, index) => {
    const open = openRows.has(row);
    const plaques = plaquesFor(script, row).map((plaque) => {
      let state: PlaqueState = 'locked';
      if (finished.has(plaque.id)) state = 'done';
      else if (open && !current) {
        state = 'current';
        current = plaque;
      }
      return { plaque, state };
    });
    const unit: PathUnit = {
      row,
      number: index + 1,
      open,
      belt: awardedBelt(progress, script, row),
      exam: open ? examDue(progress, script, row) : null,
      plaques,
      done: plaques.filter((p) => p.state === 'done').length,
    };
    if (plaques.some((p) => p.state === 'current')) currentUnit = unit;
    if (open) lastOpen = unit;
    return unit;
  });

  // Safe: the first row is always open, so lastOpen is always set.
  return { units, current, currentUnit: currentUnit ?? lastOpen! };
}

// Share of a plaque lesson's questions that ask the plaque's own kana; the rest review
// the other unlocked kana.
const PLAQUE_FOCUS_SHARE = 0.7;

export function makePlaqueQuestion(progress: Progress, plaque: Plaque, now: number, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, plaque.script);
  const review = unlocked.filter((k) => !plaque.kana.includes(k));
  const pool = [...new Set([...unlocked, ...plaque.kana])];

  const preferPlaque = review.length === 0 || rng() < PLAQUE_FOCUS_SHARE;
  const options = avoiding(preferPlaque ? plaque.kana : review, avoid, [...plaque.kana, ...review]);
  const kana = pickNext(progress, options, now, rng);
  return { kana, choices: makeChoices(kana, pool, rng) };
}
