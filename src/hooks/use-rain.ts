import { useEffect, useRef, useState } from 'react';

import type { Kana } from '@/core/kana';
import { startRain, stepRain, typeKey, type RainState } from '@/core/rain';

// If the app was in the background, don't try to catch up on minutes of rain at once.
const MAX_STEP_MS = 100;

// Runs Kana Rain: once per screen refresh, moves the rain forward by the time that passed,
// and applies what the player types.
export function useRain(pool: readonly Kana[]) {
  // The live game. Both the frame loop and the keyboard change it, so it lives in a ref
  // (a box that keeps its contents between renders) and is copied into state to redraw.
  const game = useRef<RainState>(startRain());
  const [rain, setRain] = useState(startRain);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let lastTime: number | null = null;
    let frame = 0;

    function loop(time: number) {
      const ms = lastTime === null ? 0 : Math.min(time - lastTime, MAX_STEP_MS);
      lastTime = time;
      game.current = stepRain(game.current, ms, pool, Math.random).state;
      setRain(game.current);
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [pool]);

  // Applies a change to the typing bar's text: new letters are pressed one at a time;
  // a shorter text means backspace.
  function onType(text: string) {
    if (text.length < typed.length) {
      setTyped(text.toLowerCase());
      return;
    }
    let current = typed;
    for (const key of text.slice(typed.length)) {
      const result = typeKey(game.current, current, key);
      game.current = result.state;
      current = result.typed;
    }
    setRain(game.current);
    setTyped(current);
  }

  // Enter: take what's typed as the answer (for "n" when な could still be meant).
  function onSubmit() {
    const result = typeKey(game.current, typed, 'Enter');
    game.current = result.state;
    setRain(game.current);
    setTyped(result.typed);
  }

  return { rain, typed, onType, onSubmit };
}
