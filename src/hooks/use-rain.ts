import { useEffect, useRef, useState } from 'react';

import type { Kana } from '@/core/kana';
import { pointsFor, startRain, stepRain, typeKey, type RainState, type TypeResult } from '@/core/rain';

// If the app was in the background, don't try to catch up on minutes of rain at once.
const MAX_STEP_MS = 100;
// How long a "+40" pop stays on screen after a kana is cleared.
const POP_MS = 800;

// A score pop-up where a kana was cleared.
export type Pop = {
  id: number;
  points: number;
  lane: number;
  y: number;
  until: number; // hide after this time (same clock as requestAnimationFrame)
};

// Runs Kana Rain: once per screen refresh, moves the rain forward by the time that passed,
// and applies what the player types.
export function useRain(pool: readonly Kana[]) {
  // The live game. Both the frame loop and the keyboard change it, so it lives in a ref
  // (a box that keeps its contents between renders) and is copied into state to redraw.
  const game = useRef<RainState>(startRain());
  const [rain, setRain] = useState(startRain);
  const [typed, setTyped] = useState('');
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    let lastTime: number | null = null;
    let frame = 0;

    function loop(time: number) {
      const ms = lastTime === null ? 0 : Math.min(time - lastTime, MAX_STEP_MS);
      lastTime = time;
      game.current = stepRain(game.current, ms, pool, Math.random).state;
      setRain(game.current);
      setPops((current) => (current.some((p) => p.until <= time) ? current.filter((p) => p.until > time) : current));
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [pool]);

  // Stores a key's result, and pops up the points if it cleared a kana.
  function apply(result: TypeResult) {
    game.current = result.state;
    const { cleared } = result;
    if (cleared) {
      const pop = { id: cleared.id, points: pointsFor(cleared.y), lane: cleared.lane, y: cleared.y };
      setPops((current) => [...current, { ...pop, until: performance.now() + POP_MS }]);
    }
  }

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
      apply(result);
      current = result.typed;
    }
    setRain(game.current);
    setTyped(current);
  }

  // Enter: take what's typed as the answer (for "n" when な could still be meant).
  function onSubmit() {
    const result = typeKey(game.current, typed, 'Enter');
    apply(result);
    setRain(game.current);
    setTyped(result.typed);
  }

  function restart() {
    game.current = startRain();
    setRain(game.current);
    setTyped('');
    setPops([]);
  }

  return { rain, typed, pops, onType, onSubmit, restart };
}
