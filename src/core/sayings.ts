import type { Progress } from './answers';
import { NAMED_PAIRS } from './pairs';
import type { Rng } from './random';
import { kanaTip } from './tips';

// What Karasu says when he's tapped: something about the learner's own weak spots when there
// is something, and otherwise a line of sensei wisdom.

export const SENSEI_LINES: readonly string[] = [
  'The goal is to read a kana at a glance, without having to recall it.',
  'Slow is smooth, and smooth is fast.',
  'A little every day beats a lot once a week.',
  'Every mistake shows you where to look next.',
  'Every master was once a white belt.',
  'Look at the shape itself, not the one you expect to see.',
  'A belt means you still knew it after a break.',
];

// A pair counts as a habit after this many mix-ups, and a kana needs this many answers
// before its accuracy says much.
const HABIT = 2;
const MIN_SEEN = 3;

// Share of taps that pick a personal line, when there is one.
const PERSONAL_SHARE = 0.5;

// The two kana mixed up most often (either way round), and how many times.
function mostMixedPair(progress: Progress): { a: string; b: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const { shown, guessed } of progress.confusions) {
    const key = [shown, guessed].sort().join('\t');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: { a: string; b: string; count: number } | null = null;
  for (const [key, count] of counts) {
    const [a = '', b = ''] = key.split('\t');
    if (count >= HABIT && (!best || count > best.count)) best = { a, b, count };
  }
  return best;
}

// The kana with the lowest accuracy, among those answered at least MIN_SEEN times and missed at least once.
function trickiestKana(progress: Progress): string | null {
  let worst: { char: string; accuracy: number } | null = null;
  for (const [char, stats] of Object.entries(progress.stats)) {
    if (stats.seen < MIN_SEEN || stats.correct === stats.seen) continue;
    const accuracy = stats.correct / stats.seen;
    if (!worst || accuracy < worst.accuracy) worst = { char, accuracy };
  }
  return worst?.char ?? null;
}

// A line for Karasu, never the same as `previous` (what he said last time).
export function karasuSays(progress: Progress, rng: Rng, previous?: string): string {
  const personal: string[] = [];

  const pair = mostMixedPair(progress);
  if (pair) {
    const named = NAMED_PAIRS.find(({ kana }) => kana.includes(pair.a) && kana.includes(pair.b));
    personal.push(
      named
        ? `You keep mixing up ${pair.a} and ${pair.b}. ${named.tip}`
        : `You've mixed up ${pair.a} and ${pair.b} ${pair.count} times. Look closely at both.`,
    );
  }

  const tricky = trickiestKana(progress);
  const tip = tricky ? kanaTip(tricky) : null;
  if (tricky && tip) personal.push(`${tricky} is your trickiest kana. ${tip}`);

  const fresh = (lines: readonly string[]) => lines.filter((line) => line !== previous);
  const mine = fresh(personal);
  if (mine.length > 0 && rng() < PERSONAL_SHARE) {
    // Safe: the index is within the non-empty list.
    return mine[Math.floor(rng() * mine.length)]!;
  }
  const wisdom = fresh(SENSEI_LINES);
  // Safe: the index is within the list, which still has at least six lines.
  return wisdom[Math.floor(rng() * wisdom.length)]!;
}
