import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { bestScore, completeLesson, markDue, recordAnswer, type Progress } from '@/core/answers';
import type { Kana } from '@/core/kana';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { pickNext } from '@/core/pick';
import { pointsFor, startRain, stepRain, targetOf, typeKey, type Drop, type RainState, type TypeResult } from '@/core/rain';

import { useProgress } from './use-progress';

// If the app was in the background, don't try to catch up on minutes of rain at once.
const MAX_STEP_MS = 100;
// How long a "+40" pop stays on screen after a kana is cleared.
const POP_MS = 800;

// Finished games are recorded under this name, with their score. That keeps the best score,
// and counts the game toward the streak like a lesson.
export const RAIN_LESSON_ID = 'game:rain';

// What the results screen shows after a game.
export type RainResult = {
  score: number;
  best: number | null; // the best score before this game
  summary: LessonSummary; // accuracy, strike speed and belts earned, as for a lesson
};

// A score pop-up where a kana was cleared.
export type Pop = {
  id: number;
  points: number;
  lane: number;
  y: number;
  until: number; // hide after this time (same clock as requestAnimationFrame)
};

// Runs Kana Rain: once per screen refresh, moves the rain forward by the time that passed,
// and applies what the player types. The learning engine chooses which kana fall, and sees
// how each one went: cleared is a correct answer; landing while locked on is a wrong answer;
// landing before the player started on it just makes it due again (see `landed` below).
export function useRain(pool: readonly Kana[]) {
  const { changeProgress, currentProgress } = useProgress();
  // Progress, best score and answers for the current game, to build the results at the end.
  const startProgress = useRef<Progress | null>(null);
  const bestBefore = useRef<number | null>(null);
  const answers = useRef<LessonAnswer[]>([]);
  const [result, setResult] = useState<RainResult | null>(null);
  // The live game. Both the frame loop and the keyboard change it, so it lives in a ref
  // (a box that keeps its contents between renders) and is copied into state to redraw.
  const game = useRef<RainState>(startRain());
  const [rain, setRain] = useState(startRain);
  const [typed, setTyped] = useState('');
  const [pops, setPops] = useState<Pop[]>([]);

  // One frame of the game. It's an "effect event": the loop below calls it, and it always
  // sees the latest values (like `pool`) without the loop having to restart when they change.
  const onFrame = useEffectEvent((time: number, ms: number) => {
    const locked = targetOf(game.current.drops, typed);
    const pick = () => pickNext(currentProgress(), pool, Date.now(), Math.random);
    const wasOver = game.current.over;
    const step = stepRain(game.current, ms, pick, Math.random);
    game.current = step.state;
    for (const drop of step.landed) landed(drop, drop.id === locked?.id);
    if (step.state.over && !wasOver) finish(step.state.score);
    setRain(game.current);
    setPops((current) => (current.some((p) => p.until <= time) ? current.filter((p) => p.until > time) : current));
  });

  // Notes where this game started from, for the results at the end.
  function begin() {
    startProgress.current = currentProgress();
    bestBefore.current = bestScore(currentProgress(), RAIN_LESSON_ID);
    answers.current = [];
  }
  // The same, for the first game, which starts from the effect below.
  const beginFirstGame = useEffectEvent(begin);

  useEffect(() => {
    beginFirstGame();
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

  // A kana reached the ground. If the player was locked on to it, they tried and didn't get
  // it: a wrong answer. If they never started on it, it most likely landed because they were
  // busy with others, which says nothing about knowing it, so it's only made due again.
  function landed(drop: Drop, wasLockedOn: boolean) {
    if (wasLockedOn) record(drop, false);
    else changeProgress((current) => markDue(current, drop.kana.char, Date.now()));
  }

  // Records a kana as an answer: cleared means correct, timed by how long it had been falling.
  function record(drop: Drop, cleared: boolean) {
    const ms = Math.round(drop.age);
    const answer = { char: drop.kana.char, guess: cleared ? drop.kana.char : null, ms, now: Date.now() };
    changeProgress((current) => recordAnswer(current, answer));
    answers.current = [...answers.current, { char: drop.kana.char, correct: cleared, ms }];
  }

  // The last life is gone: save the game with its score, and show the results.
  function finish(score: number) {
    changeProgress((current) => completeLesson(current, RAIN_LESSON_ID, Date.now(), score));
    const before = startProgress.current ?? currentProgress();
    setResult({
      score,
      best: bestBefore.current,
      summary: summarizeLesson(before, currentProgress(), answers.current),
    });
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
    begin();
    setResult(null);
    game.current = startRain();
    setRain(game.current);
    setTyped('');
    setPops([]);
  }

  return { rain, typed, pops, result, onType, onSubmit, restart };
}
