import type { Progress } from './answers';
import { makeChoices } from './choices';
import type { Kana, Script } from './kana';
import { pickNext } from './pick';
import type { Rng } from './random';
import { unlockedKana } from './unlock';

export type Question = {
  kana: Kana;
  choices: Kana[];
};

// Picks what to ask from the unlocked kana, and builds its answer options.
export function makeQuestion(progress: Progress, script: Script, now: number, rng: Rng): Question {
  const unlocked = unlockedKana(progress, script);
  const kana = pickNext(progress, unlocked, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
