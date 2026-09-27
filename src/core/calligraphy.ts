import type { Progress } from './answers';
import type { Kana } from './kana';
import { pickNext } from './pick';
import type { Rng } from './random';

// Calligraphy: tracing each kana stroke by stroke. A drawn stroke is judged against the real
// one (from KanjiVG, in src/constants/strokes.ts), on KanjiVG's 109-unit grid.

export type Point = readonly [number, number];

export const CALLIGRAPHY_ROUND = 5; // kana in a round
export const CALLIGRAPHY_LESSON_ID = 'game:calligraphy';
const POINTS = 24; // the real strokes' points, which a drawn stroke is compared with

// How far from the real stroke a drawn one may stray, on average and at its worst.
const CLEAN = { mean: 7, worst: 14 };
const OKAY = { mean: 13, worst: 24 };

function lengthOf(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
  return total;
}

// The same line as `n` points, evenly spaced along its length, keeping both ends.
export function resample(points: readonly Point[], n: number): Point[] {
  if (points.length === 0) return [];
  const total = lengthOf(points);
  if (total === 0) return Array.from({ length: n }, () => points[0]!);
  const out: Point[] = [points[0]!];
  let travelled = 0; // along the line, up to the start of segment i
  let i = 1;
  for (let j = 1; j < n - 1; j++) {
    const at = (total * j) / (n - 1);
    // Move on to the segment that `at` falls in.
    while (i < points.length - 1 && travelled + Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]) < at) {
      travelled += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
      i++;
    }
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    const span = Math.hypot(x1 - x0, y1 - y0) || 1;
    const f = Math.min(Math.max((at - travelled) / span, 0), 1);
    out.push([x0 + f * (x1 - x0), y0 + f * (y1 - y0)]);
  }
  out.push(points[points.length - 1]!);
  return out;
}

// How far one line strays from another of the same number of points: on average, and at worst.
function strays(a: readonly Point[], b: readonly Point[]): { mean: number; worst: number } {
  const gaps = a.map(([x, y], i) => Math.hypot(x - b[i]![0], y - b[i]![1]));
  return { mean: gaps.reduce((s, g) => s + g, 0) / gaps.length, worst: Math.max(...gaps) };
}

const within = (s: { mean: number; worst: number }, limit: { mean: number; worst: number }) =>
  s.mean <= limit.mean && s.worst <= limit.worst;

export type StrokeJudgement = 'clean' | 'okay' | 'off' | 'backwards';

// Judges a drawn stroke against the real one, comparing them point by point from start to
// end, so the direction matters. A tap, or a stroke much shorter than the real one, is off.
export function judgeStroke(drawn: readonly Point[], target: readonly Point[]): StrokeJudgement {
  if (drawn.length < 2 || lengthOf(drawn) < lengthOf(target) * 0.4) return 'off';
  const line = resample(drawn, POINTS);
  const real = resample(target, POINTS);
  const forwards = strays(line, real);
  if (within(forwards, CLEAN)) return 'clean';
  if (within(forwards, OKAY)) return 'okay';
  if (within(strays([...line].reverse(), real), OKAY)) return 'backwards';
  return 'off';
}

// A round's kana: up to CALLIGRAPHY_ROUND different ones from `pool`, weaker ones first.
export function calligraphyKana(progress: Progress, pool: readonly Kana[], rng: Rng): Kana[] {
  const chosen: Kana[] = [];
  while (chosen.length < CALLIGRAPHY_ROUND) {
    const left = pool.filter((k) => !chosen.includes(k));
    if (left.length === 0) break;
    chosen.push(pickNext(progress, left, rng));
  }
  return chosen;
}
