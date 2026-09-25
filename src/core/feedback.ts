import { NEW_KANA, type Progress } from './answers';
import { tierOf, type Belt } from './boxes';
import type { Kana } from './kana';
import { NAMED_PAIRS } from './pairs';
import { kanaTip } from './tips';

export type BeltChange = { from: Belt; to: Belt };

function beltOf(progress: Progress, char: string): Belt {
  return tierOf((progress.kana[char] ?? NEW_KANA).box);
}

// The belt a kana moved between after an answer, or null if it didn't move.
export function beltChange(before: Progress, after: Progress, char: string): BeltChange | null {
  const from = beltOf(before, char);
  const to = beltOf(after, char);
  return from === to ? null : { from, to };
}

// The tip for telling `a` and `b` apart, if they're a named pair; otherwise null.
function pairTip(a: string, b: string): string | null {
  return NAMED_PAIRS.find(({ kana }) => kana.includes(a) && kana.includes(b))?.tip ?? null;
}

// The written tip for `char` and the first kana in `others` that has one, or null.
export function pairTipFor(char: string, others: readonly string[]): string | null {
  for (const other of others) {
    const tip = pairTip(char, other);
    if (tip) return tip;
  }
  return null;
}

// A memory tip for mixing up `shown` with `guessed`: how to tell the two apart if there's a
// written tip for that pair, otherwise the shown kana's own tip.
export function tipFor(shown: Kana, guessed: Kana): string {
  return (
    pairTip(shown.char, guessed.char) ??
    kanaTip(shown.char) ??
    `${shown.char} is "${shown.romaji[0]}". ${guessed.char} is "${guessed.romaji[0]}".`
  );
}
