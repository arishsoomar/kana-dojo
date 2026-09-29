import { useEffect, useRef, useState } from 'react';

import { recordAnswer } from '@/core/answers';
import type { Kana } from '@/core/kana';
import { completeKata, kataMark, kataQuestions, kataResult, type KataMark } from '@/core/kata';
import { summarizeLesson, type LessonAnswer } from '@/core/lesson';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { localDay, useToday } from './use-today';
import { postWallNews } from './wall-news';

// How long an answer's tile stays lit before the next kana: a right one briefly, a wrong one
// long enough to see the right answer. The clock doesn't run meanwhile.
const RIGHT_FLASH_MS = 350;
const WRONG_FLASH_MS = 900;

// How often the clock on screen updates.
const TICK_MS = 100;

// Runs today's daily kata. The day is fixed when it starts, so playing past midnight still
// finishes the kata that was begun.
export function useKata() {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [day] = useState(() => localDay(Date.now()));
  const [startProgress] = useState(progress);
  const [questions] = useState(() => kataQuestions(progress, day));
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<KataMark[]>([]);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [picked, setPicked] = useState<Kana | null>(null); // the answer being flashed
  const [spentMs, setSpentMs] = useState(0); // answering time before this question
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const finished = useRef(false);

  const result = kataResult(progress, day);
  const question = questions[index] ?? null;

  // The clock, while a question is waiting for its answer.
  useEffect(() => {
    if (result || picked) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [result, picked]);

  function finish(finalMarks: readonly KataMark[], ms: number, finalAnswers: readonly LessonAnswer[]) {
    if (finished.current) return;
    finished.current = true;
    // Kana never reached (when leaving part-way) count as missed.
    const all = [...finalMarks, ...Array<KataMark>(questions.length - finalMarks.length).fill('missed')];
    changeProgress((current) => completeKata(current, day, Date.now(), all, ms));
    const summary = summarizeLesson(startProgress, currentProgress(), finalAnswers);
    postWallNews({ opened: summary.rowsOpened });
  }

  function answer(choice: Kana) {
    if (!question || picked || result) return;
    const time = Date.now();
    const ms = time - shownAt;
    const correct = choice.char === question.kana.char;
    changeProgress((current) => recordAnswer(current, { char: question.kana.char, guess: choice.char, ms, now: time }));
    if (correct) haptics.right();
    else haptics.miss();

    const nextMarks = [...marks, kataMark(correct, ms)];
    const nextAnswers = [...answers, { char: question.kana.char, correct, ms }];
    const nextSpent = spentMs + ms;
    setMarks(nextMarks);
    setAnswers(nextAnswers);
    setSpentMs(nextSpent);
    setPicked(choice);

    setTimeout(
      () => {
        if (index + 1 < questions.length) {
          setIndex(index + 1);
          setPicked(null);
          const shown = Date.now();
          setShownAt(shown);
          setNow(shown);
          return;
        }
        haptics.thunk();
        sounds.play('taiko');
        finish(nextMarks, nextSpent, nextAnswers);
      },
      correct ? RIGHT_FLASH_MS : WRONG_FLASH_MS,
    );
  }

  // Leaving part-way uses up the day's attempt: what's been answered stands, the rest are missed.
  function giveUp() {
    if (result || questions.length === 0) return;
    finish(marks, spentMs, answers);
  }

  return {
    day,
    questions,
    index,
    question,
    picked,
    result,
    // The clock: answering time so far, not counting the flashes between kana.
    ms: spentMs + (picked ? 0 : Math.max(now - shownAt, 0)),
    answer,
    giveUp,
  };
}

// What the Games card shows: today's kata number, its result if it's been played, and the hours
// until the next one.
export function useKataCard() {
  const { progress } = useProgress();
  const today = useToday();
  const [hoursLeft, setHoursLeft] = useState(() => hoursToMidnight(Date.now()));

  // Refreshes once a minute, so it's never more than a minute behind (after midnight, too).
  useEffect(() => {
    const timer = setInterval(() => setHoursLeft(hoursToMidnight(Date.now())), 60_000);
    return () => clearInterval(timer);
  }, []);

  return { today, result: kataResult(progress, today), hoursLeft };
}

// Whole hours until local midnight, rounded up (so "1h" in the last hour).
function hoursToMidnight(now: number): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(Math.ceil((midnight.getTime() - now) / 3_600_000), 1);
}
