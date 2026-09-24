import { useState } from 'react';

import { FAST_MS, recordAnswer, type Progress } from '@/core/answers';
import { beltChange, tipFor, type BeltChange } from '@/core/feedback';
import type { Kana, Script } from '@/core/kana';
import { LESSON_LENGTH, summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { makeDrillQuestion, makeQuestion, type Question } from '@/core/question';

import { useProgress } from './use-progress';

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

// A normal lesson in one script, or a drill focused on one kana.
export type LessonMode = { script: Script } | { drill: Kana };

function newQuestion(progress: Progress, mode: LessonMode): Question {
  return 'drill' in mode
    ? makeDrillQuestion(progress, mode.drill, Date.now(), Math.random)
    : makeQuestion(progress, mode.script, Date.now(), Math.random);
}

// Holds the lesson's state and connects the screen to the engine.
// The real clock and Math.random are used here, never inside src/core.
export function useLesson(mode: LessonMode) {
  const { progress, updateProgress } = useProgress();
  // Progress as it was when the lesson began, to compare against at the end.
  const [startProgress] = useState(progress);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [question, setQuestion] = useState(() => newQuestion(progress, mode));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [result, setResult] = useState<Result | null>(null);

  function check(guess: Kana) {
    const now = Date.now();
    const ms = now - shownAt;
    const { kana } = question;
    const correct = guess === kana;
    const next = recordAnswer(progress, { char: kana.char, guess: guess.char, ms, now });

    updateProgress(next);
    setAnswers([...answers, { char: kana.char, correct, ms }]);
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
    if (answers.length >= LESSON_LENGTH) {
      setSummary(summarizeLesson(startProgress, progress, answers));
      return;
    }
    setQuestion(newQuestion(progress, mode));
    setShownAt(Date.now());
    setResult(null);
  }

  return {
    question,
    result,
    summary,
    fraction: answers.length / LESSON_LENGTH,
    check,
    goToNext,
  };
}
