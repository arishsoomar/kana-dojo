import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { recordAnswer } from '@/core/answers';
import type { Kana } from '@/core/kana';
import { pickNext } from '@/core/pick';
import { pointsFor, startRain, stepRain, typeKey, type Drop, type RainState, type TypeResult } from '@/core/rain';

import { useProgress } from './use-progress';

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
// and applies what the player types. Every kana cleared or landed is recorded as an answer,
// exactly like a lesson answer, and the learning engine chooses which kana fall.
export function useRain(pool: readonly Kana[]) {
  const { changeProgress, currentProgress } = useProgress();
  // The live game. Both the frame loop and the keyboard change it, so it lives in a ref
  // (a box that keeps its contents between renders) and is copied into state to redraw.
  const game = useRef<RainState>(startRain());
  const [rain, setRain] = useState(startRain);
  const [typed, setTyped] = useState('');
  const [pops, setPops] = useState<Pop[]>([]);

  // One frame of the game. It's an "effect event": the loop below calls it, and it always
  // sees the latest values (like `pool`) without the loop having to restart when they change.
  const onFrame = useEffectEvent((time: number, ms: number) => {
    const pick = () => pickNext(currentProgress(), pool, Date.now(), Math.random);
    const result = stepRain(game.current, ms, pick, Math.random);
    game.current = result.state;
    // A kana that lands is a wrong answer with no guess.
    for (const drop of result.landed) record(drop, false);
    setRain(game.current);
    setPops((current) => (current.some((p) => p.until <= time) ? current.filter((p) => p.until > time) : current));
  });

  useEffect(() => {
    let lastTime: number | null = null;
    let frame = 0;

    function loop(time: number) {
      const ms = lastTime === null ? 0 : Math.min(time - lastTime, MAX_STEP_MS);
      lastTime = time;
      onFrame(time, ms);
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Records a kana as an answer: cleared means correct, timed by how long it had been falling.
  function record(drop: Drop, cleared: boolean) {
    const answer = { char: drop.kana.char, guess: cleared ? drop.kana.char : null, ms: Math.round(drop.age), now: Date.now() };
    changeProgress((current) => recordAnswer(current, answer));
  }

  // Stores a key's result, and pops up the points if it cleared a kana.
  function apply(result: TypeResult) {
    game.current = result.state;
    const { cleared } = result;
    if (cleared) {
      record(cleared, true);
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
