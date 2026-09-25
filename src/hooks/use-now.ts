import { useEffect, useState } from 'react';

// The current time, refreshed every `everyMs`, for screens that show a countdown.
// (It's kept in state because reading the clock during every render isn't allowed.)
export function useNow(everyMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);

  return now;
}
