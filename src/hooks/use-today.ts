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
