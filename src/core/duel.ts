import { FAST_MS, type Progress } from './answers';
import { KANA, type Kana, type Script } from './kana';
import { NAMED_PAIRS, type NamedPair } from './pairs';
import type { Question } from './question';
import type { Rng } from './random';
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

// A duel is won at DUEL_WIN points, and lost when the opponent reaches DUEL_LOSS, so it
// allows at most DUEL_LOSS - 1 misses.
export const DUEL_WIN = 10;
export const DUEL_LOSS = 5;

export type DuelScore = { mine: number; theirs: number };

export type DuelStatus = 'going' | 'won' | 'lost';

export function duelStatus(score: DuelScore): DuelStatus {
  if (score.mine >= DUEL_WIN) return 'won';
  if (score.theirs >= DUEL_LOSS) return 'lost';
  return 'going';
}

// The score after one answer: a quick right answer is my point, a wrong answer is theirs,
// and a slow right answer is nobody's. Once the duel is over, nothing changes.
export function scorePoint(score: DuelScore, answer: { correct: boolean; ms: number }): DuelScore {
  if (duelStatus(score) !== 'going') return score;
  if (!answer.correct) return { ...score, theirs: score.theirs + 1 };
  return answer.ms < FAST_MS ? { ...score, mine: score.mine + 1 } : score;
}

// One point of a duel: either kana of the pair at random, with the two as the only answers
// (in kana-chart order, like every other question). The same kana can come twice in a row:
// with only two, taking turns would give every answer away.
export function duelQuestion(pair: NamedPair, rng: Rng): Question {
  const choices = KANA.filter((k) => pair.kana.includes(k.char));
  // Safe: a named pair is two real kana (checked in pairs.test.ts), so choices has both.
  const kana: Kana = choices[rng() < 0.5 ? 0 : 1]!;
  return { kana, choices };
}
