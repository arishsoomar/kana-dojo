import { intervalFor, isDue, MAX_BOX, type KanaProgress } from './boxes';

export type Confusion = {
  shown: string;
  guessed: string;
};

export type Progress = {
  kana: Readonly<Record<string, KanaProgress>>;
  confusions: readonly Confusion[];
};

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

export function recordAnswer(progress: Progress, answer: Answer): Progress {
  const current = progress.kana[answer.char] ?? NEW_KANA;
  const correct = answer.guess === answer.char;

  if (correct) {
    return {
      ...progress,
      kana: { ...progress.kana, [answer.char]: afterCorrect(current, answer) },
    };
  }

  return {
    ...progress,
    kana: { ...progress.kana, [answer.char]: afterWrong(current, answer) },
    confusions: [...progress.confusions, { shown: answer.char, guessed: answer.guess }],
  };
}
