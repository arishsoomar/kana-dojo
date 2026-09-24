import { useState } from 'react';

import { completeLesson, FAST_MS, recordAnswer, type Progress } from '@/core/answers';
import { beltChange, tipFor, type BeltChange } from '@/core/feedback';
import type { Kana, Script } from '@/core/kana';
import { LESSON_LENGTH, summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { makePlaqueQuestion, type Plaque } from '@/core/path';
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

// A plaque from the Learn path, a practice lesson in one script, or a drill on one kana.
export type LessonMode = { plaque: Plaque } | { script: Script } | { drill: Kana };

function newQuestion(progress: Progress, mode: LessonMode): Question {
  const now = Date.now();
  if ('plaque' in mode) return makePlaqueQuestion(progress, mode.plaque, now, Math.random);
  if ('drill' in mode) return makeDrillQuestion(progress, mode.drill, now, Math.random);
  return makeQuestion(progress, mode.script, now, Math.random);
}

// The name a finished lesson is recorded under. Plaque ids mark plaques as done;
// every finished lesson counts toward the streak (D4).
export function lessonId(mode: LessonMode): string {
  if ('plaque' in mode) return mode.plaque.id;
  if ('drill' in mode) return `drill:${mode.drill.char}`;
  return `practice:${mode.script}`;
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
      updateProgress(completeLesson(progress, lessonId(mode), Date.now()));
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
