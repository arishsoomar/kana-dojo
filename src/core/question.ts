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

// The options to ask from, without the kana just asked (`avoid`), so the same kana never
// comes twice in a row. If that leaves nothing, the fallback is tried the same way; if that
// leaves nothing too, the kana is the only one there is, so it's asked again.
export function avoiding(options: readonly Kana[], avoid?: string, fallback: readonly Kana[] = []): readonly Kana[] {
  if (!avoid) return options;
  const others = options.filter((k) => k.char !== avoid);
  if (others.length > 0) return others;
  const fallbackOthers = fallback.filter((k) => k.char !== avoid);
  return fallbackOthers.length > 0 ? fallbackOthers : options;
}

// Picks what to ask from the unlocked kana, and builds its answer options.
export function makeQuestion(progress: Progress, script: Script, now: number, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, script);
  const kana = pickNext(progress, avoiding(unlocked, avoid), now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}

// Share of drill questions that ask the drilled kana itself.
const DRILL_FOCUS_SHARE = 0.5;

// A question for drilling one kana: about half the time the kana itself, otherwise a kana
// it gets mixed up with or looks like. Choices come from the kana unlocked in its script.
export function makeDrillQuestion(progress: Progress, focus: Kana, now: number, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, focus.script);
  const related = new Set([...mixUpsOf(progress, focus.char).map((m) => m.char), ...lookalikesOf(focus.char)]);
  const partners = unlocked.filter((k) => related.has(k.char));

  const preferFocus = partners.length === 0 || rng() < DRILL_FOCUS_SHARE;
  const options = avoiding(preferFocus ? [focus] : partners, avoid, [focus, ...partners]);
  const kana = pickNext(progress, options, now, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
