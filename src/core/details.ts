import { NEW_KANA, type Progress } from './answers';
import { tierOf, type Belt } from './boxes';
import type { Kana } from './kana';
import { median } from './lesson';

export type MixUp = { char: string; count: number };

export type KanaDetails = {
  belt: Belt;
  accuracy: number | null; // 0 to 1; null if never answered
  strikeSpeedMs: number | null; // median of recent correct answers; null if none
  dueInMs: number; // 0 or less means due now
  mixUps: MixUp[]; // most frequent first
};

// Everything the engine knows about one kana.
export function kanaDetails(progress: Progress, kana: Kana, now: number): KanaDetails {
  const box = progress.kana[kana.char] ?? NEW_KANA;
  const stats = progress.stats[kana.char];

  return {
    belt: tierOf(box.box),
    accuracy: stats && stats.seen > 0 ? stats.correct / stats.seen : null,
    strikeSpeedMs: stats ? median(stats.recentMs) : null,
    dueInMs: Math.max(box.dueAt - now, 0),
    mixUps: mixUpsOf(progress, kana.char),
  };
}

// The kana this one gets confused with, counting both directions (shown as it, or picked for it).
export function mixUpsOf(progress: Progress, char: string): MixUp[] {
  const counts = new Map<string, number>();
  for (const { shown, guessed } of progress.confusions) {
    const other = shown === char ? guessed : guessed === char ? shown : null;
    if (other) counts.set(other, (counts.get(other) ?? 0) + 1);
  }
  return [...counts].map(([other, count]) => ({ char: other, count })).sort((a, b) => b.count - a.count);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// A wait as a short phrase, rounded up: "Now", "20 min", "6 hours", "2 days".
export function formatWait(ms: number): string {
  if (ms <= 0) return 'Now';
  if (ms < HOUR) return `${Math.ceil(ms / MINUTE)} min`;
  if (ms < DAY) return plural(Math.ceil(ms / HOUR), 'hour');
  return plural(Math.ceil(ms / DAY), 'day');
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}
