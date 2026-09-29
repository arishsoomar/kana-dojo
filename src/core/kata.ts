import { FAST_MS, type Completion, type Progress } from './answers';
import { makeChoices } from './choices';
import { KANA } from './kana';
import type { Question } from './question';
import { seededRng, shuffle } from './random';
import { metKana, unlockedKana } from './unlock';

// The daily kata: one fixed challenge a day. Every kana is shuffled by a seed made from the
// date, so everyone's order is the same; a learner's kata is the first 20 in that order they've
// met. It's one attempt, and the result is a grid of fast, slow and missed squares that can be
// shared without giving the kana away. Days are "YYYY-MM-DD" in the learner's own timezone,
// worked out outside the engine.

export const KATA_LENGTH = 20;

// Kata #1 was played on this day.
const FIRST_DAY = Date.UTC(2026, 0, 1);
const DAY_MS = 86_400_000;

export type KataMark = 'fast' | 'slow' | 'missed';

export type KataResult = {
  day: string;
  number: number;
  marks: KataMark[];
  right: number;
  ms: number; // the time spent answering, in milliseconds
};

// "game:" so it counts as a game for mon.
export function kataId(day: string): string {
  return `game:kata:${day}`;
}

// Which kata a day is: #1 on 1 January 2026, counting up by one a day.
export function kataNumber(day: string): number {
  const [year, month, date] = day.split('-').map(Number);
  // UTC keeps the count independent of the device's timezone.
  const at = Date.UTC(year ?? 2026, (month ?? 1) - 1, date ?? 1);
  return Math.round((at - FIRST_DAY) / DAY_MS) + 1;
}

// The kana a kata can ask: every one the learner has met, in both scripts.
function kataPool(progress: Progress) {
  return [...metKana(progress, 'hiragana'), ...metKana(progress, 'katakana')];
}

// How many kana the learner has met toward opening the kata.
export function kataMet(progress: Progress): number {
  return kataPool(progress).length;
}

export function kataOpen(progress: Progress): boolean {
  return kataMet(progress) >= KATA_LENGTH;
}

// The day's kata: its kana in the day's order, each with four choices from the kana unlocked
// in its own script. Nothing, if the kata isn't open yet.
export function kataQuestions(progress: Progress, day: string): Question[] {
  if (!kataOpen(progress)) return [];
  const rng = seededRng(`kata:${day}`);
  const met = new Set(kataPool(progress).map((k) => k.char));
  const chosen = shuffle(KANA, rng)
    .filter((k) => met.has(k.char))
    .slice(0, KATA_LENGTH);
  const unlocked = { hiragana: unlockedKana(progress, 'hiragana'), katakana: unlockedKana(progress, 'katakana') };
  return chosen.map((kana) => ({ kana, choices: makeChoices(kana, unlocked[kana.script], rng) }));
}

export function kataMark(correct: boolean, ms: number): KataMark {
  if (!correct) return 'missed';
  return ms < FAST_MS ? 'fast' : 'slow';
}

const MARK_LETTERS: Readonly<Record<KataMark, string>> = { fast: 'f', slow: 's', missed: 'm' };

function markOf(letter: string): KataMark {
  return letter === 'f' ? 'fast' : letter === 's' ? 'slow' : 'missed';
}

// Records the day's kata as played, with its marks and time.
export function completeKata(progress: Progress, day: string, now: number, marks: readonly KataMark[], ms: number): Progress {
  const record: Completion = {
    lesson: kataId(day),
    at: now,
    score: marks.filter((m) => m !== 'missed').length,
    marks: marks.map((m) => MARK_LETTERS[m]).join(''),
    ms,
  };
  return { ...progress, completed: [...progress.completed, record] };
}

// The day's kata, if it's been played. (If it was somehow played twice, on two devices before
// they synced, the first counts.)
export function kataResult(progress: Progress, day: string): KataResult | null {
  const record = progress.completed.find((c) => c.lesson === kataId(day));
  if (!record) return null;
  const marks = [...(record.marks ?? '')].map(markOf);
  return { day, number: kataNumber(day), marks, right: marks.filter((m) => m !== 'missed').length, ms: record.ms ?? 0 };
}

const SQUARES: Readonly<Record<KataMark, string>> = { fast: '🟩', slow: '🟨', missed: '🟥' };
const SQUARES_PER_LINE = 5;

// The result as text to post: the kata, the score and time, and the grid. No kana, so it gives
// nothing away to someone who hasn't played yet.
export function kataShareText(result: KataResult): string {
  const lines: string[] = [];
  for (let i = 0; i < result.marks.length; i += SQUARES_PER_LINE) {
    lines.push(result.marks.slice(i, i + SQUARES_PER_LINE).map((m) => SQUARES[m]).join(''));
  }
  const seconds = (result.ms / 1000).toFixed(1);
  return [`Kana Dojo · Daily kata #${result.number}`, `${result.right}/${result.marks.length} in ${seconds}s`, '', ...lines].join('\n');
}
