import { MAX_BOX, tierOf, type Belt, type KanaProgress } from './boxes';
import { DEFAULT_DAILY_GOAL } from './goal';
import type { Script } from './kana';

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
// game, its score. A duel also keeps the opponent's score.
export type Completion = {
  lesson: string;
  at: number;
  score?: number;
  opponent?: number;
};

// The learner's choices, as opposed to their training record.
export type Settings = {
  onboarded: boolean; // has been through the welcome and chosen a goal
  dailyGoal: number; // lessons per day
  script: Script; // the script the Learn screen shows
  sound: boolean; // kana are spoken aloud after each answer
  haptics: boolean; // the phone taps and buzzes on answers and big moments
  typing: boolean; // lessons ask for the romaji to be typed, instead of tapped from four
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
  settings: { onboarded: false, dailyGoal: DEFAULT_DAILY_GOAL, script: 'hiragana', sound: true, haptics: true, typing: false },
};

export type Answer = {
  char: string; // the kana that was shown
  guess: string | null; // the kana the learner picked, or null if they gave no answer
  ms: number; // how long they took to answer
  now: number; // timestamp of the answer
  typed?: boolean; // typed out instead of picked from the choices: harder, so it counts double
};

// A quick answer: it earns bonus XP, and scores in a duel.
export const FAST_MS = 4000;

// How fast a right answer must be to move a kana up, by the belt it's climbing from. Each
// belt asks for more speed, since reading at a glance is the goal. Typing takes longer than
// tapping, so typed answers get more time.
const CLIMB_MS: Readonly<Record<Exclude<Belt, 'black'>, { tap: number; type: number }>> = {
  white: { tap: 4000, type: 6000 },
  green: { tap: 2500, type: 4000 },
  brown: { tap: 1500, type: 3000 },
};

export function climbLimit(box: number, typed: boolean): number {
  const belt = tierOf(box);
  // A black-belt kana has nowhere left to climb; it's held to the brown limit.
  const limits = CLIMB_MS[belt === 'black' ? 'brown' : belt];
  return typed ? limits.type : limits.tap;
}

// Steps up for a quick right answer. Typing the romaji is harder than picking it, so it's worth two.
const TAP_STEPS = 1;
const TYPED_STEPS = 2;

function afterCorrect(current: KanaProgress, answer: Answer): KanaProgress {
  const typed = answer.typed ?? false;
  const quick = answer.ms < climbLimit(current.box, typed);
  const steps = quick ? (typed ? TYPED_STEPS : TAP_STEPS) : 0;
  return { box: Math.min(current.box + steps, MAX_BOX), at: answer.now };
}

// Wrong answers drop this many boxes.
const WRONG_DROP = 2;

function afterWrong(current: KanaProgress, answer: Answer): KanaProgress {
  return { box: Math.max(current.box - WRONG_DROP, 0), at: answer.now };
}

// Progress for a kana the learner has never answered: lowest box.
export const NEW_KANA: KanaProgress = { box: 0, at: 0 };

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

  // No guess (typed nonsense, or a kana left to land in Kana Rain) is wrong, but nothing
  // was confused with it.
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

// Marks the welcome as seen, so it isn't shown again.
export function finishOnboarding(progress: Progress): Progress {
  return { ...progress, settings: { ...progress.settings, onboarded: true } };
}

// Sets which script the Learn screen shows.
export function setScript(progress: Progress, script: Script): Progress {
  return { ...progress, settings: { ...progress.settings, script } };
}

// Turns speaking kana aloud on or off.
export function setSound(progress: Progress, sound: boolean): Progress {
  return { ...progress, settings: { ...progress.settings, sound } };
}

// Turns the phone's taps and buzzes on or off.
export function setHaptics(progress: Progress, haptics: boolean): Progress {
  return { ...progress, settings: { ...progress.settings, haptics } };
}

// Switches lessons between typing answers and tapping them.
export function setTyping(progress: Progress, typing: boolean): Progress {
  return { ...progress, settings: { ...progress.settings, typing } };
}

// True when nothing has been trained yet (settings like the daily goal don't count).
export function isEmptyProgress(progress: Progress): boolean {
  return (
    Object.keys(progress.kana).length === 0 &&
    Object.keys(progress.stats).length === 0 &&
    progress.confusions.length === 0 &&
    progress.completed.length === 0
  );
}
