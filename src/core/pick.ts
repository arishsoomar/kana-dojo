import { NEW_KANA, type Progress } from './answers';
import { MAX_BOX, type KanaProgress } from './boxes';
import type { Kana } from './kana';
import type { Rng } from './random';

// Box 0 weighs 10, box 9 (black) weighs 1: kana still being learned come up far more often,
// and black-belt kana still come up now and then.
function weightOf(progress: KanaProgress): number {
  return MAX_BOX + 1 - progress.box;
}

// Picks one candidate at random, weighted toward low-box kana.
export function pickNext(progress: Progress, candidates: readonly Kana[], rng: Rng): Kana {
  if (candidates.length === 0) throw new Error('pickNext needs at least one candidate');

  const weighted = candidates.map((kana) => ({
    kana,
    weight: weightOf(progress.kana[kana.char] ?? NEW_KANA),
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
