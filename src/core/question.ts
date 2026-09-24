import type { Progress } from './answers';
import { makeChoices } from './choices';
import { mixUpsOf } from './details';
import { lookalikesOf, type Kana, type Script } from './kana';
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

// Share of drill questions that ask the drilled kana itself.
const DRILL_FOCUS_SHARE = 0.5;

// A question for drilling one kana: about half the time the kana itself, otherwise a kana
// it gets mixed up with or looks like. Choices come from the kana unlocked in its script.
export function makeDrillQuestion(progress: Progress, focus: Kana, now: number, rng: Rng): Question {
  const unlocked = unlockedKana(progress, focus.script);
  const related = new Set([...mixUpsOf(progress, focus.char).map((m) => m.char), ...lookalikesOf(focus.char)]);
  const partners = unlocked.filter((k) => related.has(k.char));

  const kana = partners.length === 0 || rng() < DRILL_FOCUS_SHARE ? focus : pickNext(progress, partners, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
