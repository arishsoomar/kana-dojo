import { lookalikesOf, type Kana } from './kana';
import { shuffle, type Rng } from './random';

const CHOICE_COUNT = 4;

// The answer plus three distractors from `pool`, in random order.
// Lookalikes in the pool are used first; no two choices share a romaji.
export function makeChoices(answer: Kana, pool: readonly Kana[], rng: Rng): Kana[] {
  const lookalikes = lookalikesOf(answer.char);
  const isLookalike = (k: Kana) => lookalikes.includes(k.char);
  const candidates = [...pool.filter(isLookalike), ...shuffle(pool.filter((k) => !isLookalike(k)), rng)];

  const chosen: Kana[] = [answer];
  const usedRomaji = new Set(answer.romaji);

  for (const candidate of candidates) {
    if (chosen.length === CHOICE_COUNT) break;
    if (candidate.romaji.some((r) => usedRomaji.has(r))) continue;
    chosen.push(candidate);
    candidate.romaji.forEach((r) => usedRomaji.add(r));
  }

  return shuffle(chosen, rng);
}
