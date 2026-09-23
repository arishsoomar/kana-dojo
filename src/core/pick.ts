import { NEW_KANA, type Progress } from './answers';
import { isDue, MAX_BOX, type KanaProgress } from './boxes';
import type { Kana } from './kana';
import type { Rng } from './random';

// How many times more likely a due kana is to be picked than one that isn't.
const DUE_WEIGHT = 10;

// Box 0 weighs 8, box 7 weighs 1. Due kana are multiplied by DUE_WEIGHT.
function weightOf(progress: KanaProgress, now: number): number {
  const lowBoxWeight = MAX_BOX + 1 - progress.box;
  return isDue(progress, now) ? lowBoxWeight * DUE_WEIGHT : lowBoxWeight;
}

// Picks one candidate at random, weighted toward due and low-box kana.
export function pickNext(progress: Progress, candidates: readonly Kana[], now: number, rng: Rng): Kana {
  if (candidates.length === 0) throw new Error('pickNext needs at least one candidate');

  const weighted = candidates.map((kana) => ({
    kana,
    weight: weightOf(progress.kana[kana.char] ?? NEW_KANA, now),
  }));
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);

  let remaining = rng() * total;
  for (const { kana, weight } of weighted) {
    remaining -= weight;
    if (remaining < 0) return kana;
  }
  // Only reached through floating-point rounding; the list is non-empty (checked above).
  return weighted[weighted.length - 1]!.kana;
}
