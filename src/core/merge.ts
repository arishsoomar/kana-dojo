import type { Completion, Confusion, KanaStats, Partnering, Progress, Purchase } from './answers';
import type { KanaProgress } from './boxes';
import type { WordCard } from './srs';

// Combines two copies of one learner's progress (say, the phone's and the cloud's) so that
// practice on either device counts. The training record comes out the same whichever order
// the copies are given in; settings are choices, not training, so they come from `mine`.
export function mergeProgress(mine: Progress, theirs: Progress): Progress {
  return {
    kana: mergeRecords(mine.kana, theirs.kana, laterKana),
    confusions: mergeConfusions(mine.confusions, theirs.confusions),
    stats: mergeRecords(mine.stats, theirs.stats, moreStats),
    completed: mergeCompleted(mine.completed, theirs.completed),
    purchases: mergePurchases(mine.purchases, theirs.purchases),
    partners: mergePartners(mine.partners, theirs.partners),
    words: mergeRecords(mine.words, theirs.words, laterCard),
    grammar: mergeRecords(mine.grammar, theirs.grammar, laterCard),
    settings: { ...mine.settings, onboarded: mine.settings.onboarded || theirs.settings.onboarded },
  };
}

// Every key from either record, in sorted order (so the result doesn't depend on which copy
// came first). Where both have a key, `pick` chooses which value to keep.
function mergeRecords<T>(a: Readonly<Record<string, T>>, b: Readonly<Record<string, T>>, pick: (x: T, y: T) => T) {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  const merged: Record<string, T> = {};
  for (const key of keys) {
    const x = a[key];
    const y = b[key];
    // Safe: every key came from a or b, so at least one of them is set.
    merged[key] = x !== undefined && y !== undefined ? pick(x, y) : (x ?? y)!;
  }
  return merged;
}

// The copy answered most recently, or on a tie, the higher box.
function laterKana(x: KanaProgress, y: KanaProgress): KanaProgress {
  if (x.at !== y.at) return x.at > y.at ? x : y;
  return x.box >= y.box ? x : y;
}

// The word card reviewed more recently, or on a tie, the one reviewed more often.
function laterCard(x: WordCard, y: WordCard): WordCard {
  if (x.last !== y.last) return x.last > y.last ? x : y;
  return x.reps >= y.reps ? x : y;
}

// The stats that have seen more answers. Ties are settled by comparing the whole value,
// so the choice never depends on order.
function moreStats(x: KanaStats, y: KanaStats): KanaStats {
  if (x.seen !== y.seen) return x.seen > y.seen ? x : y;
  if (x.correct !== y.correct) return x.correct > y.correct ? x : y;
  return JSON.stringify(x) >= JSON.stringify(y) ? x : y;
}

// Both copies share whatever was synced before, and a mix-up log has no dates, so shared
// entries can't be told apart. Each pair keeps the larger of its two counts, which never
// counts a shared mix-up twice (at the cost of missing one both devices logged separately).
function mergeConfusions(a: readonly Confusion[], b: readonly Confusion[]): Confusion[] {
  const counts = (log: readonly Confusion[]) => {
    const map = new Map<string, number>();
    for (const c of log) map.set(`${c.shown}\t${c.guessed}`, (map.get(`${c.shown}\t${c.guessed}`) ?? 0) + 1);
    return map;
  };
  const ca = counts(a);
  const cb = counts(b);
  const keys = [...new Set([...ca.keys(), ...cb.keys()])].sort();
  return keys.flatMap((key) => {
    const [shown = '', guessed = ''] = key.split('\t');
    const times = Math.max(ca.get(key) ?? 0, cb.get(key) ?? 0);
    return Array.from({ length: times }, () => ({ shown, guessed }));
  });
}

// Every finished lesson from either copy, once each, oldest first.
// Every purchase from either copy, once each, oldest first. (One made on both devices at the
// same moment for the same item is the same purchase.)
function mergePurchases(a: readonly Purchase[], b: readonly Purchase[]): Purchase[] {
  const byKey = new Map<string, Purchase>();
  for (const p of [...a, ...b]) byKey.set(`${p.at}\t${p.item}`, p);
  return [...byKey.entries()].sort(([kx, x], [ky, y]) => x.at - y.at || (kx < ky ? -1 : kx > ky ? 1 : 0)).map(([, p]) => p);
}

// Every partner assignment from either copy, once per day and friend: finished if either copy
// finished it, chosen at the earlier time. Oldest day first, then by when chosen.
function mergePartners(a: readonly Partnering[], b: readonly Partnering[]): Partnering[] {
  const byKey = new Map<string, Partnering>();
  for (const p of [...a, ...b]) {
    const key = `${p.day}\t${p.friend}`;
    const other = byKey.get(key);
    byKey.set(key, other ? { ...p, at: Math.min(p.at, other.at), done: p.done || other.done } : p);
  }
  return [...byKey.values()].sort((x, y) => (x.day < y.day ? -1 : x.day > y.day ? 1 : x.at - y.at || (x.friend < y.friend ? -1 : 1)));
}

function mergeCompleted(a: readonly Completion[], b: readonly Completion[]): Completion[] {
  const byKey = new Map<string, Completion>();
  for (const c of [...a, ...b]) byKey.set(`${c.at}\t${c.lesson}\t${c.score ?? ''}`, c);
  // Oldest first; two lessons finished at the same moment are ordered by their key.
  return [...byKey.entries()]
    .sort(([kx, x], [ky, y]) => x.at - y.at || (kx < ky ? -1 : kx > ky ? 1 : 0))
    .map(([, c]) => c);
}
