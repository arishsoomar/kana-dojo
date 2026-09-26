import { useState } from 'react';

import { pronounce } from '@/audio/pronounce';

import { completeLesson, FAST_MS, recordAnswer, setSound, type Progress } from '@/core/answers';
import { beltChange, tipFor, type BeltChange } from '@/core/feedback';
import type { Kana, Script } from '@/core/kana';
import { LESSON_LENGTH, summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { makePlaqueQuestion, type Plaque } from '@/core/path';
import { makeDrillQuestion, makeQuestion, type Question } from '@/core/question';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { postWallNews } from './wall-news';

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

// `avoid` is the kana just asked, so the same one never comes twice in a row.
function newQuestion(progress: Progress, mode: LessonMode, avoid?: string): Question {
  const now = Date.now();
  if ('plaque' in mode) return makePlaqueQuestion(progress, mode.plaque, now, Math.random, avoid);
  if ('drill' in mode) return makeDrillQuestion(progress, mode.drill, now, Math.random, avoid);
  return makeQuestion(progress, mode.script, now, Math.random, avoid);
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
  const { progress, updateProgress, currentProgress } = useProgress();
  // Progress as it was when the lesson began, to compare against at the end.
  const [startProgress] = useState(progress);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [question, setQuestion] = useState(() => newQuestion(progress, mode));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [result, setResult] = useState<Result | null>(null);
  // The kana just answered, which is spoken aloud (unless muted) and shown with a replay button.
  // Nothing is spoken before an answer: hearing it first would give the answer away.
  const [heard, setHeard] = useState<Kana | null>(null);
  // Karasu's reaction to the latest answer: a hop for right, a head-shake for wrong. The id
  // counts answers, so the same reaction twice in a row still plays twice.
  const [reaction, setReaction] = useState<{ kind: 'hop' | 'shake'; id: number } | null>(null);
  const sound = progress.settings.sound;
  const haptics = useHaptics();

  function check(guess: Kana) {
    const now = Date.now();
    const ms = now - shownAt;
    const { kana } = question;
    const correct = guess === kana;
    setHeard(kana);
    if (sound) pronounce(kana);
    if (correct) haptics.right();
    else haptics.miss();
    setReaction({ kind: correct ? 'hop' : 'shake', id: answers.length });
    const next = recordAnswer(progress, { char: kana.char, guess: guess.char, ms, now });

    updateProgress(next);
    const nextAnswers = [...answers, { char: kana.char, correct, ms }];
    setAnswers(nextAnswers);

    // A correct answer goes straight to the next question.
    if (correct) {
      advance(nextAnswers, kana.char);
      return;
    }
    // A wrong one waits on the feedback sheet, so the correction and memory tip can be read.
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

  // The next question, or the summary once the lesson is complete. It reads the latest
  // progress, since it can run from a timer after the answer that just changed it.
  function advance(answersSoFar: LessonAnswer[], justAsked: string) {
    const latest = currentProgress();
    if (answersSoFar.length >= LESSON_LENGTH) {
      updateProgress(completeLesson(latest, lessonId(mode), Date.now()));
      haptics.thunk();
      const done = summarizeLesson(startProgress, latest, answersSoFar);
      // A plaque finished for the first time gets its seal stamped on the wall.
      const firstTime = 'plaque' in mode && !startProgress.completed.some((c) => c.lesson === mode.plaque.id);
      postWallNews({ stamped: firstTime ? [mode.plaque.id] : [], opened: done.rowsOpened });
      setSummary(done);
      return;
    }
    setQuestion(newQuestion(latest, mode, justAsked));
    setShownAt(Date.now());
    setResult(null);
  }

  // Continue, from the feedback sheet after a wrong answer.
  function goToNext() {
    advance(answers, question.kana.char);
  }

  function toggleSound() {
    updateProgress(setSound(currentProgress(), !sound));
  }

  return {
    question,
    result,
    summary,
    heard,
    reaction,
    sound,
    toggleSound,
    fraction: answers.length / LESSON_LENGTH,
    check,
    goToNext,
  };
}
