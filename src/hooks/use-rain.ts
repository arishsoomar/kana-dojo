import { useEffect, useState } from 'react';

import type { Kana } from '@/core/kana';
import { startRain, stepRain, type RainState } from '@/core/rain';

// If the app was in the background, don't try to catch up on minutes of rain at once.
const MAX_STEP_MS = 100;

// Runs Kana Rain: once per screen refresh, moves the rain forward by the time that passed.
export function useRain(pool: readonly Kana[]): RainState {
  const [rain, setRain] = useState(startRain);

  useEffect(() => {
    // The game's current state lives here, inside the loop, and is copied into React
    // state each frame so the screen redraws.
    let current = startRain();
    let lastTime: number | null = null;
    let frame = 0;

    function loop(time: number) {
      const ms = lastTime === null ? 0 : Math.min(time - lastTime, MAX_STEP_MS);
      lastTime = time;
      current = stepRain(current, ms, pool, Math.random).state;
      setRain(current);
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [pool]);

  return rain;
}
