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

// A finished lesson or game: which one, when (a timestamp in milliseconds), and for a
// game, its score.
export type Completion = {
  lesson: string;
  at: number;
  score?: number;
};

// The learner's choices, as opposed to their training record.
export type Settings = {
  onboarded: boolean; // has seen the welcome
};

export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
  stats: Readonly<Record<string, KanaStats>>;
  completed: readonly Completion[];
  settings: Settings;
};

// A learner who hasn't answered anything yet.
export const EMPTY_PROGRESS: Progress = {
  kana: {},
  confusions: [],
  stats: {},
  completed: [],
  settings: { onboarded: false },
};

export type Answer = {
  char: string; // the kana that was shown
  guess: string | null; // the kana the learner picked, or null if they gave no answer
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

  // No guess (a kana left to land in Kana Rain) is wrong, but nothing was confused with it.
  const confusions =
    answer.guess === null
      ? progress.confusions
      : [...progress.confusions, { shown: answer.char, guessed: answer.guess }];

  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    stats,
    confusions,
  };
}

// Records that a lesson (or a game, with its score) was finished at `now`.
export function completeLesson(progress: Progress, lesson: string, now: number, score?: number): Progress {
  const record: Completion = score === undefined ? { lesson, at: now } : { lesson, at: now, score };
  return { ...progress, completed: [...progress.completed, record] };
}

// The highest score recorded for a game, or null if it has never been finished.
export function bestScore(progress: Progress, lesson: string): number | null {
  const scores = progress.completed.flatMap((c) => (c.lesson === lesson && c.score !== undefined ? [c.score] : []));
  return scores.length === 0 ? null : Math.max(...scores);
}

// Makes a kana due now, without scoring anything: its box, stats and mix-ups stay the same.
// Used when a kana went unanswered for a reason that says nothing about knowing it
// (in Kana Rain, one that landed before the player had started on it).
export function markDue(progress: Progress, char: string, now: number): Progress {
  const current = progress.kana[char] ?? NEW_KANA;
  return { ...progress, kana: { ...progress.kana, [char]: { ...current, dueAt: Math.min(current.dueAt, now) } } };
}

// Marks the welcome as seen, so it isn't shown again.
export function finishOnboarding(progress: Progress): Progress {
  return { ...progress, settings: { ...progress.settings, onboarded: true } };
}
