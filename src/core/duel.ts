import type { Progress } from './answers';
import type { Script } from './kana';
import { NAMED_PAIRS, type NamedPair } from './pairs';
import { unlockedKana } from './unlock';

// Duels: fast rounds on one named pair of lookalikes, built from the learner's own mix-ups.

// How many times a pair must be mixed up before its duel is offered.
export const DUEL_READY_MIXUPS = 3;

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

export type WeakPair = {
  pair: NamedPair;
  mixUps: number; // times the two were confused, either way round
  ready: boolean; // mixed up enough, and both kana unlocked
};

// Every named pair with how often the learner has mixed it up, most mixed-up first.
// Pairs mixed up equally often keep their order in NAMED_PAIRS.
export function weakPairs(progress: Progress): WeakPair[] {
  const open = new Set(SCRIPTS.flatMap((script) => unlockedKana(progress, script)).map((k) => k.char));

  return NAMED_PAIRS.map((pair) => {
    const [a, b] = pair.kana;
    const mixUps = progress.confusions.filter(
      ({ shown, guessed }) => (shown === a && guessed === b) || (shown === b && guessed === a),
    ).length;
    return { pair, mixUps, ready: mixUps >= DUEL_READY_MIXUPS && open.has(a) && open.has(b) };
  }).sort((x, y) => y.mixUps - x.mixUps);
}
