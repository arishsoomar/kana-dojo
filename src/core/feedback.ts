import { NEW_KANA, type Progress } from './answers';
import { tierOf, type Belt } from './boxes';
import type { Kana } from './kana';
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

// How to tell apart the kana in each lookalike pair.
const PAIR_TIPS: readonly { pair: readonly [string, string]; tip: string }[] = [
  { pair: ['シ', 'ツ'], tip: "シ's short strokes stack on the left and its long stroke sweeps up. ツ's short strokes sit on top and its long stroke sweeps down." },
  { pair: ['ソ', 'ン'], tip: "ソ's short stroke sits on top and its long stroke falls down. ン's short stroke sits on the left and its long stroke sweeps up." },
  { pair: ['ぬ', 'め'], tip: 'ぬ ends in a little loop at the bottom right. め has no loop.' },
  { pair: ['わ', 'ね'], tip: 'ね ends in a little loop. わ ends in a smooth curve with no loop.' },
  { pair: ['わ', 'れ'], tip: 'れ ends with a tail that kicks out to the right. わ curves back in and stays round.' },
  { pair: ['ね', 'れ'], tip: 'ね ends in a little loop. れ ends with a tail that kicks out to the right.' },
  { pair: ['る', 'ろ'], tip: 'る ends in a loop at the bottom. ろ is open, with no loop.' },
  { pair: ['さ', 'ち'], tip: 'ち curves out to the right, like the bottom of a 5. さ is the mirror image: its curve bulges to the left.' },
];

function pairTip(a: string, b: string): string | null {
  return PAIR_TIPS.find(({ pair }) => pair.includes(a) && pair.includes(b))?.tip ?? null;
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
