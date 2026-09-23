import { useState } from 'react';

import { FAST_MS, recordAnswer, type Progress } from '@/core/answers';
import { beltChange, tipFor, type BeltChange } from '@/core/feedback';
import type { Kana, Script } from '@/core/kana';
import { makeQuestion, type Question } from '@/core/question';

// What happened on the last answer, for the feedback sheet.
export type Result = {
  kana: Kana;
  guess: Kana;
  correct: boolean;
  fast: boolean;
  ms: number;
  beltChange: BeltChange | null;
  tip: string | null;
};

// No saved progress yet (that's C4), so every lesson starts as a new learner.
const NEW_LEARNER: Progress = { kana: {}, confusions: [] };

function newQuestion(progress: Progress, script: Script): Question {
  return makeQuestion(progress, script, Date.now(), Math.random);
}

// Holds the lesson's state and connects the screen to the engine.
// The real clock and Math.random are used here, never inside src/core.
export function useLesson(script: Script) {
  const [progress, setProgress] = useState(NEW_LEARNER);
  const [question, setQuestion] = useState(() => newQuestion(NEW_LEARNER, script));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [result, setResult] = useState<Result | null>(null);

  function check(guess: Kana) {
    const now = Date.now();
    const ms = now - shownAt;
    const { kana } = question;
    const correct = guess === kana;
    const next = recordAnswer(progress, { char: kana.char, guess: guess.char, ms, now });

    setProgress(next);
    setResult({
      kana,
      guess,
      correct,
      fast: ms < FAST_MS,
      ms,
      beltChange: beltChange(progress, next, kana.char),
      tip: correct ? null : tipFor(kana, guess),
    });
  }

  function goToNext() {
    setQuestion(newQuestion(progress, script));
    setShownAt(Date.now());
    setResult(null);
  }

  return { question, result, check, goToNext };
}
