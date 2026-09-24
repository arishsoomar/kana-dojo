import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { completeLesson, recordAnswer, type Progress } from '@/core/answers';
import type { Belt } from '@/core/boxes';
import { makeChoices } from '@/core/choices';
import { EXAM_TIME_MS, examId, examQuestions, examStatus, type ExamStatus } from '@/core/exam';
import { KANA, type Kana, type RowId, type Script } from '@/core/kana';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { unlockedKana } from '@/core/unlock';

import { useProgress } from './use-progress';

// How long the picked answer shows right or wrong before the next question.
const FLASH_MS = 450;
// How often the countdown updates.
const TICK_MS = 250;

type Attempt = {
  questions: Kana[];
  pool: Kana[]; // where wrong options come from: the row itself, when it has enough kana
  choices: Kana[];
  index: number;
  answers: LessonAnswer[];
  startedAt: number;
  shownAt: number; // when the current question appeared
  startProgress: Progress;
};

function newAttempt(progress: Progress, script: Script, row: RowId): Attempt {
  const questions = examQuestions(script, row, Math.random);
  // Wrong options come from the same row, so the exam tests telling the row's kana apart.
  // A 3-kana row can't fill four options by itself, so it borrows from the unlocked kana.
  const rowKana = KANA.filter((k) => k.script === script && k.row === row);
  const pool = rowKana.length >= 4 ? rowKana : unlockedKana(progress, script);
  const now = Date.now();
  return {
    questions,
    pool,
    // Safe: an exam always has EXAM_LENGTH (20) questions.
    choices: makeChoices(questions[0]!, pool, Math.random),
    index: 0,
    answers: [],
    startedAt: now,
    shownAt: now,
    startProgress: progress,
  };
}

export type ExamResult = {
  status: ExamStatus; // 'passed' or 'failed'
  correct: number;
  summary: LessonSummary;
};

// Runs a belt exam on one row: 20 questions, 60 seconds, no hints.
export function useExam(script: Script, row: RowId, belt: Belt) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const [attempt, setAttempt] = useState(() => newAttempt(progress, script, row));
  const [now, setNow] = useState(() => Date.now());
  const [flash, setFlash] = useState<{ guess: Kana; correct: boolean } | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  // Set once the attempt is saved, so the timer and the last answer can't both save it.
  const finished = useRef(false);

  const correct = attempt.answers.filter((a) => a.correct).length;
  const misses = attempt.answers.length - correct;
  const remainingMs = Math.max(EXAM_TIME_MS - (now - attempt.startedAt), 0);

  // The countdown. When time runs out, the exam ends with what's been answered.
  const onTick = useEffectEvent(() => {
    const time = Date.now();
    setNow(time);
    if (time - attempt.startedAt >= EXAM_TIME_MS) finish(attempt, true);
  });

  useEffect(() => {
    if (result) return;
    const timer = setInterval(onTick, TICK_MS);
    return () => clearInterval(timer);
  }, [result]);

  // Saves the attempt (the score is the number correct) and shows the result.
  function finish(done: Attempt, timeUp: boolean) {
    if (finished.current) return;
    const right = done.answers.filter((a) => a.correct).length;
    const status = examStatus({ correct: right, misses: done.answers.length - right, timeUp });
    if (status === 'going') return;
    finished.current = true;
    changeProgress((current) => completeLesson(current, examId(script, row, belt), Date.now(), right));
    setResult({ status, correct: right, summary: summarizeLesson(done.startProgress, currentProgress(), done.answers) });
  }

  function answer(guess: Kana) {
    if (flash || result) return;
    const kana = attempt.questions[attempt.index];
    if (!kana) return;
    const time = Date.now();
    const ms = time - attempt.shownAt;
    const right = guess === kana;
    changeProgress((current) => recordAnswer(current, { char: kana.char, guess: guess.char, ms, now: time }));
    const answers = [...attempt.answers, { char: kana.char, correct: right, ms }];
    setFlash({ guess, correct: right });

    // After the flash, move on, or end the exam if the result is now certain.
    setTimeout(() => {
      setFlash(null);
      if (finished.current) return; // time ran out during the flash
      const next = attempt.questions[attempt.index + 1];
      const done = { ...attempt, answers };
      const status = examStatus({ correct: answers.filter((a) => a.correct).length, misses: answers.filter((a) => !a.correct).length, timeUp: false });
      if (status !== 'going' || !next) {
        setAttempt(done);
        finish(done, false);
        return;
      }
      setAttempt({ ...done, index: attempt.index + 1, choices: makeChoices(next, attempt.pool, Math.random), shownAt: Date.now() });
    }, FLASH_MS);
  }

  function retake() {
    finished.current = false;
    setResult(null);
    setFlash(null);
    const fresh = newAttempt(currentProgress(), script, row);
    setAttempt(fresh);
    setNow(fresh.startedAt);
  }

  return {
    kana: attempt.questions[attempt.index],
    choices: attempt.choices,
    correct,
    misses,
    remainingMs,
    flash,
    result,
    answer,
    retake,
  };
}
