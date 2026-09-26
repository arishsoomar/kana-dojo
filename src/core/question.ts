import type { Progress } from './answers';
import { makeChoices } from './choices';
import { mixUpsOf } from './details';
import { lookalikesOf, type Kana, type Script } from './kana';
import { pickNext } from './pick';
import type { Rng } from './random';
import { metKana, unlockedKana } from './unlock';

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

// Picks what to ask from the kana the learner has met (all unlocked kana, for someone who
// hasn't met any yet), and builds its answer options from every unlocked kana.
export function makeQuestion(progress: Progress, script: Script, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, script);
  const met = metKana(progress, script);
  const kana = pickNext(progress, avoiding(met.length > 0 ? met : unlocked, avoid), rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}

// Share of drill questions that ask the drilled kana itself.
const DRILL_FOCUS_SHARE = 0.5;

// A question for drilling one kana: about half the time the kana itself, otherwise a kana
// it gets mixed up with, or one it looks like that the learner has met. Choices come from
// the kana unlocked in its script.
export function makeDrillQuestion(progress: Progress, focus: Kana, rng: Rng, avoid?: string): Question {
  const unlocked = unlockedKana(progress, focus.script);
  const mixUps = new Set(mixUpsOf(progress, focus.char).map((m) => m.char));
  const met = new Set(metKana(progress, focus.script));
  const lookalikes = lookalikesOf(focus.char);
  const partners = unlocked.filter((k) => mixUps.has(k.char) || (met.has(k) && lookalikes.includes(k.char)));

  const preferFocus = partners.length === 0 || rng() < DRILL_FOCUS_SHARE;
  const options = avoiding(preferFocus ? [focus] : partners, avoid, [focus, ...partners]);
  const kana = pickNext(progress, options, rng);
  return { kana, choices: makeChoices(kana, unlocked, rng) };
}
