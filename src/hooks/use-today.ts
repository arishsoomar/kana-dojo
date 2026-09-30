import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

// A timestamp as a calendar date ("YYYY-MM-DD") in the device's own timezone.
export function localDay(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Today's date, kept up to date: it refreshes at midnight and whenever the app comes back
// to the foreground. (It's kept in state because reading the clock during every render
// isn't allowed.)
export function useToday(): string {
  const [today, setToday] = useState(() => localDay(Date.now()));

  useEffect(() => {
    const refresh = () => setToday(localDay(Date.now()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    // A second past midnight, so the new day has definitely started.
    const timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 1000);
    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [today]);

  return today;
}

// Whole hours left in the day, rounded up (so "1h" in the last hour). Refreshes once a minute.
export function useHoursLeft(): number {
  const [hoursLeft, setHoursLeft] = useState(() => hoursToMidnight(Date.now()));
  useEffect(() => {
    const timer = setInterval(() => setHoursLeft(hoursToMidnight(Date.now())), 60_000);
    return () => clearInterval(timer);
  }, []);
  return hoursLeft;
}

function hoursToMidnight(now: number): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(Math.ceil((midnight.getTime() - now) / 3_600_000), 1);
}

// A day ("YYYY-MM-DD") in the device's timezone, as timestamps: its midnight, and the next.
export function dayBounds(day: string): { start: number; end: number } {
  const [year = 1970, month = 1, date = 1] = day.split('-').map(Number);
  return { start: new Date(year, month - 1, date).getTime(), end: new Date(year, month - 1, date + 1).getTime() };
}
