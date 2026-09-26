import { FAST_MS, type Completion, type Progress } from './answers';
import { KANA, type Kana, type RowId, type Script } from './kana';
import { NAMED_PAIRS, pairId, type NamedPair } from './pairs';
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

// Every unlocked kana in both scripts, by character.
function openChars(progress: Progress): Set<string> {
  return new Set(SCRIPTS.flatMap((script) => unlockedKana(progress, script)).map((k) => k.char));
}

// Every named pair with how often the learner has mixed it up, most mixed-up first.
// Pairs mixed up equally often keep their order in NAMED_PAIRS.
export function weakPairs(progress: Progress): WeakPair[] {
  const open = openChars(progress);

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

// How a duel is named in the finished-lesson records, e.g. "duel:シツ".
export function duelId(pair: NamedPair): string {
  return `duel:${pairId(pair)}`;
}

// Records a finished duel, won or lost, with both scores.
export function completeDuel(progress: Progress, pair: NamedPair, score: DuelScore, now: number): Progress {
  const record: Completion = { lesson: duelId(pair), at: now, score: score.mine, opponent: score.theirs };
  return { ...progress, completed: [...progress.completed, record] };
}

export type ScrollState = 'won' | 'ready' | 'locked';

// One slot in the scroll collection. A scroll is won by winning its pair's duel, and keeps
// the first win; until then it's ready (the duel can be played) or locked.
export type Scroll = {
  pair: NamedPair;
  mixUps: number;
  state: ScrollState;
  firstWin: { at: number; score: DuelScore } | null;
  opensWith: Kana | null; // the first kana of the row that must open before it can be duelled
};

const STATE_ORDER: readonly ScrollState[] = ['won', 'ready', 'locked'];

// Every named pair's scroll: won ones first, then ready, then locked. Within each group,
// the most mixed-up pairs come first (the order weakPairs gives).
export function scrolls(progress: Progress): Scroll[] {
  const open = openChars(progress);
  return weakPairs(progress)
    .map(({ pair, mixUps, ready }): Scroll => {
      const wins = progress.completed
        .filter((c) => c.lesson === duelId(pair))
        .map((c) => ({ at: c.at, score: { mine: c.score ?? 0, theirs: c.opponent ?? 0 } }))
        .filter((c) => duelStatus(c.score) === 'won');
      const firstWin = wins.reduce<Scroll['firstWin']>((first, win) => (first === null || win.at < first.at ? win : first), null);
      const state = firstWin ? 'won' : ready ? 'ready' : 'locked';
      return { pair, mixUps, state, firstWin, opensWith: rowToOpen(pair, open) };
    })
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state));
}

// For a pair with a kana still locked: the first kana of the row that has to open, which is
// the later of the two kana's rows (KANA lists rows in unlock order). Null when both are open.
function rowToOpen(pair: NamedPair, open: Set<string>): Kana | null {
  const locked = KANA.filter((k) => pair.kana.includes(k.char) && !open.has(k.char));
  const last = locked[locked.length - 1];
  if (!last) return null;
  return KANA.find((k) => k.script === last.script && k.row === last.row) ?? null;
}

// Where a pair's duel plaque hangs on the Learn path: its script, and the later of its two
// kana's rows (KANA lists rows in unlock order), since that's the row that opens the duel.
export function duelRow(pair: NamedPair): { script: Script; row: RowId } {
  const kana = KANA.filter((k) => pair.kana.includes(k.char));
  // Safe: a named pair is two real kana (checked in pairs.test.ts).
  const last = kana[kana.length - 1]!;
  return { script: last.script, row: last.row };
}
