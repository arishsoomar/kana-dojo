import { EMPTY_PROGRESS, type Completion, type Confusion, type KanaStats, type Progress } from './answers';
import { MAX_BOX, type KanaProgress } from './boxes';
import { DEFAULT_DAILY_GOAL, isDailyGoal } from './goal';

// Bump this if the saved shape changes, and teach parseProgress to read the old one.
// Version 1 had no stats and version 2 had no finished lessons; both are still read,
// with those parts empty. Versions 1 to 3 had 8 boxes with waiting times (see oldKana).
const SAVE_VERSION = 4;
const READABLE_VERSIONS: readonly unknown[] = [1, 2, 3, 4];

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
    kana: !isObject(kana) ? {} : data.version === SAVE_VERSION ? validEntries(kana, isKanaProgress) : oldKana(kana),
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
  // Sound and haptics are on unless they were saved as off.
  const sound = !(isObject(settings) && settings.sound === false);
  const haptics = !(isObject(settings) && settings.haptics === false);
  // Typing is off (answers are tapped) unless it was saved as on.
  const typing = isObject(settings) && settings.typing === true;
  return { ...progress, settings: { onboarded, dailyGoal, script, sound, haptics, typing } };
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

function isBox(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

function isKanaProgress(value: unknown): value is KanaProgress {
  return isObject(value) && isBox(value.box, MAX_BOX) && typeof value.at === 'number';
}

// Before version 4 there were 8 boxes (0–7) and each had a waiting time, saved as when the
// kana was next due. Each old box maps to the new box at the same belt (green was 3–4,
// brown 5–6, black 7), and the last answer is the due time minus the old box's wait.
const OLD_BOX_TO_NEW = [0, 1, 2, 3, 4, 6, 7, 9];
const OLD_WAITS = [0, 0, 0, 20 * 60_000, 6 * 3_600_000, 2 * 86_400_000, 7 * 86_400_000, 21 * 86_400_000];
const OLD_MAX_BOX = 7;

function oldKana(saved: Record<string, unknown>): Record<string, KanaProgress> {
  const out: Record<string, KanaProgress> = {};
  for (const [char, value] of Object.entries(saved)) {
    if (!isObject(value) || !isBox(value.box, OLD_MAX_BOX) || typeof value.dueAt !== 'number') continue;
    // Safe: the box was checked to be 0–7, a valid index into both lists.
    out[char] = { box: OLD_BOX_TO_NEW[value.box]!, at: Math.max(value.dueAt - OLD_WAITS[value.box]!, 0) };
  }
  return out;
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
