import { EMPTY_PROGRESS, type Completion, type Confusion, type KanaStats, type Progress } from './answers';
import { MAX_BOX, type KanaProgress } from './boxes';
import { DEFAULT_DAILY_GOAL, isDailyGoal } from './goal';

// Bump this if the saved shape changes, and teach parseProgress to read the old one.
// Version 1 had no stats and version 2 had no finished lessons; both are still read,
// with those parts empty.
const SAVE_VERSION = 3;
const READABLE_VERSIONS: readonly unknown[] = [1, 2, 3];

const EMPTY = EMPTY_PROGRESS;

// Progress as text, ready to store on the device.
export function serializeProgress(progress: Progress): string {
  return JSON.stringify({ version: SAVE_VERSION, progress });
}

// Reads text written by serializeProgress. Anything missing or damaged is dropped,
// so a bad save can never crash the app; at worst the learner starts fresh.
export function parseProgress(text: string | null): Progress {
  if (text === null) return EMPTY;

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return EMPTY;
  }
  if (!isObject(data) || !READABLE_VERSIONS.includes(data.version) || !isObject(data.progress)) return EMPTY;

  const { kana, confusions, stats, completed, settings } = data.progress;
  const progress = {
    kana: isObject(kana) ? validEntries(kana, isKanaProgress) : {},
    confusions: Array.isArray(confusions) ? confusions.filter(isConfusion) : [],
    stats: isObject(stats) ? validEntries(stats, isKanaStats) : {},
    completed: Array.isArray(completed) ? completed.filter(isCompletion) : [],
  };
  // Saves from before onboarding existed have no settings. Anyone with saved progress
  // has clearly been using the app, so they count as onboarded.
  const hasProgress = Object.keys(progress.kana).length > 0 || progress.completed.length > 0 || Object.keys(progress.stats).length > 0;
  const onboarded = isObject(settings) && typeof settings.onboarded === 'boolean' ? settings.onboarded : hasProgress;
  const dailyGoal = isObject(settings) && isDailyGoal(settings.dailyGoal) ? settings.dailyGoal : DEFAULT_DAILY_GOAL;
  const script = isObject(settings) && settings.script === 'katakana' ? 'katakana' : 'hiragana';
  return { ...progress, settings: { onboarded, dailyGoal, script } };
}

// Keeps the entries whose value passes `isValid`.
function validEntries<T>(saved: Record<string, unknown>, isValid: (value: unknown) => value is T): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [char, value] of Object.entries(saved)) {
    if (isValid(value)) result[char] = value;
  }
  return result;
}

// `unknown` means "could be anything"; these checks narrow it down before we trust it.
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKanaProgress(value: unknown): value is KanaProgress {
  return (
    isObject(value) &&
    typeof value.box === 'number' &&
    Number.isInteger(value.box) &&
    value.box >= 0 &&
    value.box <= MAX_BOX &&
    typeof value.dueAt === 'number'
  );
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isKanaStats(value: unknown): value is KanaStats {
  return (
    isObject(value) &&
    isCount(value.seen) &&
    isCount(value.correct) &&
    Array.isArray(value.recentMs) &&
    value.recentMs.every((ms) => typeof ms === 'number')
  );
}

function isConfusion(value: unknown): value is Confusion {
  return isObject(value) && typeof value.shown === 'string' && typeof value.guessed === 'string';
}

function isCompletion(value: unknown): value is Completion {
  return (
    isObject(value) &&
    typeof value.lesson === 'string' &&
    typeof value.at === 'number' &&
    (value.score === undefined || typeof value.score === 'number') &&
    (value.opponent === undefined || typeof value.opponent === 'number')
  );
}
