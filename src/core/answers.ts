import { intervalFor, isDue, MAX_BOX, type KanaProgress } from './boxes';

export type Confusion = {
  shown: string;
  guessed: string;
};

// A kana's answer history, for accuracy and strike speed.
export type KanaStats = {
  seen: number;
  correct: number;
  recentMs: readonly number[]; // times of the most recent correct answers, oldest first
};

export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
  stats: Readonly<Record<string, KanaStats>>;
};

// A learner who hasn't answered anything yet.
export const EMPTY_PROGRESS: Progress = { kana: {}, confusions: [], stats: {} };

export type Answer = {
  char: string; // the kana that was shown
  guess: string; // the kana the learner picked
  ms: number; // how long they took to answer
  now: number; // timestamp of the answer
};

// Answers must be faster than this to earn a promotion.
export const FAST_MS = 4000;

function afterCorrect(current: KanaProgress, answer: Answer): KanaProgress {
  if (!isDue(current, answer.now)) return current;

  const box = answer.ms < FAST_MS ? Math.min(current.box + 1, MAX_BOX) : current.box;
  return { box, dueAt: answer.now + intervalFor(box) };
}

// Wrong answers drop this many boxes.
const WRONG_DROP = 2;

function afterWrong(current: KanaProgress, answer: Answer): KanaProgress {
  return { box: Math.max(current.box - WRONG_DROP, 0), dueAt: answer.now };
}

// Progress for a kana the learner has never answered: lowest box, due now.
export const NEW_KANA: KanaProgress = { box: 0, dueAt: 0 };

const NEW_STATS: KanaStats = { seen: 0, correct: 0, recentMs: [] };

// How many recent correct times to keep per kana.
const RECENT_TIMES = 10;

function afterAnswer(stats: KanaStats, correct: boolean, ms: number): KanaStats {
  return {
    seen: stats.seen + 1,
    correct: stats.correct + (correct ? 1 : 0),
    recentMs: correct ? [...stats.recentMs, ms].slice(-RECENT_TIMES) : stats.recentMs,
  };
}

export function recordAnswer(progress: Progress, answer: Answer): Progress {
  const current = progress.kana[answer.char] ?? NEW_KANA;
  const correct = answer.guess === answer.char;
  const stats = {
    ...progress.stats,
    [answer.char]: afterAnswer(progress.stats[answer.char] ?? NEW_STATS, correct, answer.ms),
  };

  if (correct) {
    return {
      ...progress,
      kana: { ...progress.kana, [answer.char]: afterCorrect(current, answer) },
      stats,
    };
  }

  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    stats,
    confusions: [...progress.confusions, { shown: answer.char, guessed: answer.guess }],
  };
}
