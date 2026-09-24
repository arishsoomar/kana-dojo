import { EMPTY_PROGRESS } from './answers';
import { DAILY_GOALS, DEFAULT_DAILY_GOAL, lessonsOn, setDailyGoal } from './goal';

describe('daily goal', () => {
  it('offers 5, 10, 15 or 20 minutes, as 1 to 4 lessons', () => {
    expect(DAILY_GOALS.map((g) => [g.minutes, g.lessons])).toEqual([
      [5, 1],
      [10, 2],
      [15, 3],
      [20, 4],
    ]);
  });

  it('starts at 2 lessons a day (Regular)', () => {
    expect(DEFAULT_DAILY_GOAL).toBe(2);
    expect(EMPTY_PROGRESS.settings.dailyGoal).toBe(2);
  });

  it('can be changed, without changing the progress it was given', () => {
    const next = setDailyGoal(EMPTY_PROGRESS, 4);
    expect(next.settings.dailyGoal).toBe(4);
    expect(EMPTY_PROGRESS.settings.dailyGoal).toBe(2);
  });

  it('counts the lessons finished on a given day', () => {
    expect(lessonsOn(['2026-09-23', '2026-09-24', '2026-09-24'], '2026-09-24')).toBe(2);
    expect(lessonsOn([], '2026-09-24')).toBe(0);
  });
});
