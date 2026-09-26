import { useState } from 'react';

import { recordAnswer } from '@/core/answers';
import {
  completeDuel,
  duelQuestion,
  duelStatus,
  scorePoint,
  weakPairs,
  type DuelScore,
  type DuelStatus,
} from '@/core/duel';
import type { Kana } from '@/core/kana';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import type { NamedPair } from '@/core/pairs';

import { useHaptics } from './use-haptics';
import { useSoundEffects } from './use-sound-effects';
import { useProgress } from './use-progress';
import { postWallNews } from './wall-news';

// How long a wrong answer shows (red on the pick, green on the answer) before the next point.
// A right answer moves on straight away.
const MISS_MS = 700;

const START: DuelScore = { mine: 0, theirs: 0 };

export type DuelResult = {
  status: Exclude<DuelStatus, 'going'>; // 'won' or 'lost'
  score: DuelScore;
  summary: LessonSummary;
};

// Runs a duel on one named pair: first to 10 points, lost if the opponent reaches 5.
export function useDuel(pair: NamedPair) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [startProgress, setStartProgress] = useState(progress);
  // How often the pair had been mixed up when the duel opened.
  const [mixUps] = useState(() => weakPairs(progress).find((w) => w.pair === pair)?.mixUps ?? 0);
  const [question, setQuestion] = useState(() => duelQuestion(pair, Math.random));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [score, setScore] = useState(START);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [miss, setMiss] = useState<Kana | null>(null); // the wrong pick being shown
  const [slow, setSlow] = useState(false); // the last answer was right but too slow to score
  const [result, setResult] = useState<DuelResult | null>(null);

  function nextPoint() {
    setQuestion(duelQuestion(pair, Math.random));
    setShownAt(Date.now());
  }

  function answer(guess: Kana) {
    if (miss || result) return;
    const now = Date.now();
    const ms = now - shownAt;
    const correct = guess === question.kana;
    if (correct) haptics.right();
    else haptics.miss();
    changeProgress((current) => recordAnswer(current, { char: question.kana.char, guess: guess.char, ms, now }));

    const nextScore = scorePoint(score, { correct, ms });
    const nextAnswers = [...answers, { char: question.kana.char, correct, ms }];
    setScore(nextScore);
    setAnswers(nextAnswers);
    setSlow(correct && nextScore.mine === score.mine);

    const status = duelStatus(nextScore);
    if (status !== 'going') {
      if (status === 'won') haptics.success();
      else haptics.thunk();
      sounds.play('taiko');
      changeProgress((current) => completeDuel(current, pair, nextScore, now));
      const summary = summarizeLesson(startProgress, currentProgress(), nextAnswers);
      postWallNews({ opened: summary.rowsOpened });
      setResult({ status, score: nextScore, summary });
      return;
    }
    if (correct) {
      nextPoint();
      return;
    }
    setMiss(guess);
    setTimeout(() => {
      setMiss(null);
      nextPoint();
    }, MISS_MS);
  }

  function retry() {
    setStartProgress(currentProgress());
    setScore(START);
    setAnswers([]);
    setMiss(null);
    setSlow(false);
    setResult(null);
    nextPoint();
  }

  return { question, score, mixUps, miss, slow, result, answer, retry };
}
