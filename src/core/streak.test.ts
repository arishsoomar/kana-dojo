import { addDays, streakOf } from './streak';

const TODAY = '2026-09-23'; // a Wednesday

// The day `n` days before today.
function ago(n: number): string {
  return addDays(TODAY, -n);
}

describe('addDays', () => {
  it('moves across month ends', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('streakOf', () => {
  it('starts at zero with one rest day', () => {
    const streak = streakOf([], TODAY);
    expect(streak.current).toBe(0);
    expect(streak.restDays).toBe(1);
    expect(streak.trainedToday).toBe(false);
  });

  it('counts consecutive trained days, including today', () => {
    const streak = streakOf([ago(2), ago(1), TODAY], TODAY);
    expect(streak.current).toBe(3);
    expect(streak.trainedToday).toBe(true);
  });

  it("doesn't break the streak just because today isn't done yet", () => {
    const streak = streakOf([ago(3), ago(2), ago(1)], TODAY);
    expect(streak.current).toBe(3);
    expect(streak.trainedToday).toBe(false);
  });

  it('counts the same day once, however many lessons were done', () => {
    expect(streakOf([ago(1), ago(1), TODAY, TODAY], TODAY).current).toBe(2);
  });

  it('uses a rest day to cover one missed day', () => {
    const streak = streakOf([ago(4), ago(3), ago(1)], TODAY);
    expect(streak.current).toBe(3);
    expect(streak.restDays).toBe(0);
    expect(streak.week.find((d) => d.day === ago(2))?.status).toBe('rest');
  });

  it('breaks when a day is missed with no rest day left, and remembers the old streak', () => {
    // Rest day used on ago(4); ago(2) is missed with none left.
    const streak = streakOf([ago(6), ago(5), ago(3), ago(1)], TODAY);
    expect(streak.current).toBe(1);
    expect(streak.previous).toBe(3);
    expect(streak.week.find((d) => d.day === ago(2))?.status).toBe('missed');
  });

  it('is zero once more days are missed than rest days can cover', () => {
    const streak = streakOf([ago(5), ago(4)], TODAY);
    expect(streak.current).toBe(0);
    expect(streak.previous).toBe(2);
  });

  it('earns a rest day every 7 days, holding at most 2', () => {
    const days = (n: number) => Array.from({ length: n }, (_, i) => ago(n - 1 - i));
    expect(streakOf(days(7), TODAY).restDays).toBe(2);
    expect(streakOf(days(14), TODAY).restDays).toBe(2);
  });

  it('shows the last seven days, oldest first, with weekday letters', () => {
    const streak = streakOf([ago(1)], TODAY);
    expect(streak.week.map((d) => d.letter).join('')).toBe('TFSSMTW');
    expect(streak.week.map((d) => d.status)).toEqual(['none', 'none', 'none', 'none', 'none', 'trained', 'today']);
  });
});
