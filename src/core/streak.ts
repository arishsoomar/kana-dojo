// Days are calendar dates written as "YYYY-MM-DD" in the learner's own timezone.
// Turning a timestamp into a local date needs the device's timezone, so that happens
// outside the engine; everything here only works with the date strings.

export type DayStatus = 'trained' | 'rest' | 'missed' | 'today' | 'none';

export type StreakDay = {
  day: string;
  letter: string; // weekday initial, e.g. "W"
  status: DayStatus;
};

export type Streak = {
  current: number; // days in a row, counting rest days as kept but not as trained
  trainedToday: boolean;
  restDays: number; // rest days available now
  maxRestDays: number;
  previous: number | null; // length of the most recent streak that broke, if any
  week: StreakDay[]; // the last seven days, oldest first, ending today
};

// Every learner starts with one rest day, earns one more for every 7 days in a row,
// and can hold at most two.
const STARTING_REST_DAYS = 1;
const MAX_REST_DAYS = 2;
const REST_DAY_EVERY = 7;

const WEEKDAY_LETTERS = 'SMTWTFS';

function toDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  // UTC keeps the arithmetic independent of the device's timezone.
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1));
}

// The date `days` after `day` (negative for before).
export function addDays(day: string, days: number): string {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Works out the streak by walking every day from the first lesson to today.
export function streakOf(trainedDays: readonly string[], today: string): Streak {
  const trained = new Set(trainedDays);
  const statuses = new Map<string, DayStatus>();
  let current = 0;
  let restDays = STARTING_REST_DAYS;
  let previous: number | null = null;

  // "YYYY-MM-DD" strings sort in date order, so the smallest is the first day.
  const first = [...trained].sort()[0];
  if (first !== undefined) {
    for (let day = first; day <= today; day = addDays(day, 1)) {
      if (trained.has(day)) {
        current += 1;
        if (current % REST_DAY_EVERY === 0) restDays = Math.min(restDays + 1, MAX_REST_DAYS);
        statuses.set(day, 'trained');
      } else if (day === today) {
        // Today isn't over yet, so it can't be missed.
        statuses.set(day, 'today');
      } else if (current > 0 && restDays > 0) {
        restDays -= 1;
        statuses.set(day, 'rest');
      } else {
        if (current > 0) previous = current;
        current = 0;
        statuses.set(day, 'missed');
      }
    }
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6);
    return {
      day,
      letter: WEEKDAY_LETTERS[toDate(day).getUTCDay()] ?? '',
      status: statuses.get(day) ?? (day === today ? 'today' : 'none'),
    };
  });

  return {
    current,
    trainedToday: trained.has(today),
    restDays,
    maxRestDays: MAX_REST_DAYS,
    previous,
    week,
  };
}
