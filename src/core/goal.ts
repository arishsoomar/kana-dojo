import type { Progress } from './answers';

// The daily goal. The learner picks it in minutes, but the app counts finished lessons
// (it never rewards time spent), so each choice is a number of lessons per day.
export const DAILY_GOALS = [
  { minutes: 5, lessons: 1, name: 'Casual' },
  { minutes: 10, lessons: 2, name: 'Regular' },
  { minutes: 15, lessons: 3, name: 'Serious' },
  { minutes: 20, lessons: 4, name: 'Intense' },
] as const;

export const DEFAULT_DAILY_GOAL = 2;

export function isDailyGoal(value: unknown): value is number {
  return DAILY_GOALS.some((g) => g.lessons === value);
}

export function setDailyGoal(progress: Progress, lessons: number): Progress {
  return { ...progress, settings: { ...progress.settings, dailyGoal: lessons } };
}

// How many lessons were finished on `day`, given the day ("YYYY-MM-DD") of each one.
export function lessonsOn(finishedDays: readonly string[], day: string): number {
  return finishedDays.filter((d) => d === day).length;
}
