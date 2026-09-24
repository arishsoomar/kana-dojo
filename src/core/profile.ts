import type { Progress } from './answers';
import { tierOf } from './boxes';
import { awardedBelt } from './exam';
import { KANA, ROWS, type Script } from './kana';
import { median } from './lesson';

// Numbers for the Profile screen, all worked out from saved progress.

const SCRIPTS: readonly Script[] = ['hiragana', 'katakana'];

// Kana past white belt, in both scripts.
export function kanaLearned(progress: Progress): number {
  return KANA.filter((k) => tierOf(progress.kana[k.char]?.box ?? 0) !== 'white').length;
}

// Share of all answers that were correct, or null before any answers.
export function overallAccuracy(progress: Progress): number | null {
  const all = Object.values(progress.stats);
  const seen = all.reduce((sum, s) => sum + s.seen, 0);
  return seen === 0 ? null : all.reduce((sum, s) => sum + s.correct, 0) / seen;
}

// The median of every kana's recent correct answer times, or null.
export function overallStrikeSpeed(progress: Progress): number | null {
  return median(Object.values(progress.stats).flatMap((s) => s.recentMs));
}

// Rows (out of 20) that have earned a belt by passing an exam.
export function rowBeltsEarned(progress: Progress): number {
  return SCRIPTS.flatMap((script) => ROWS.map((row) => awardedBelt(progress, script, row))).filter((b) => b !== 'white')
    .length;
}

// When the first lesson was finished, or null.
export function trainingSince(progress: Progress): number | null {
  const times = progress.completed.map((c) => c.at);
  return times.length === 0 ? null : Math.min(...times);
}

// Lessons, games and exams finished at or after `since`.
export function lessonsSince(progress: Progress, since: number): number {
  return progress.completed.filter((c) => c.at >= since).length;
}

export type BadgeProgress = {
  level: number; // how many goals have been reached
  goal: number | null; // the next goal, or null once all are reached
  value: number;
};

// Where `value` stands against a badge's goals, e.g. streak days against [7, 30, 100].
export function badgeLevel(value: number, goals: readonly number[]): BadgeProgress {
  const level = goals.filter((goal) => value >= goal).length;
  return { level, goal: goals[level] ?? null, value };
}
