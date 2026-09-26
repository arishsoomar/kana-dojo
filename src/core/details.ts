import { climbLimit, NEW_KANA, type Progress } from './answers';
import { BELT_STARTS, BELTS, tierOf, type Belt } from './boxes';
import type { Kana } from './kana';
import { median } from './lesson';

export type MixUp = { char: string; count: number };

export type KanaDetails = {
  belt: Belt;
  accuracy: number | null; // 0 to 1; null if never answered
  strikeSpeedMs: number | null; // median of recent correct answers; null if none
  nextBelt: NextBelt | null; // null at black belt
  mixUps: MixUp[]; // most frequent first
};

// What the next belt takes: this many more quick right answers (typed ones count double),
// each under tapMs when tapped or typeMs when typed.
export type NextBelt = { belt: Belt; steps: number; tapMs: number; typeMs: number };

function nextBeltFor(box: number): NextBelt | null {
  const next = BELTS[BELTS.indexOf(tierOf(box)) + 1];
  if (!next) return null;
  return { belt: next, steps: BELT_STARTS[next] - box, tapMs: climbLimit(box, false), typeMs: climbLimit(box, true) };
}

// Everything the engine knows about one kana.
export function kanaDetails(progress: Progress, kana: Kana): KanaDetails {
  const box = progress.kana[kana.char] ?? NEW_KANA;
  const stats = progress.stats[kana.char];

  return {
    belt: tierOf(box.box),
    accuracy: stats && stats.seen > 0 ? stats.correct / stats.seen : null,
    strikeSpeedMs: stats ? median(stats.recentMs) : null,
    nextBelt: nextBeltFor(box.box),
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
