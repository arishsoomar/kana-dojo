import type { Confusion, Progress } from './answers';
import { MAX_BOX, type KanaProgress } from './boxes';

// Bump this if the saved shape changes, and teach parseProgress to read the old one.
const SAVE_VERSION = 1;

const EMPTY: Progress = { kana: {}, confusions: [] };

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
  if (!isObject(data) || data.version !== SAVE_VERSION || !isObject(data.progress)) return EMPTY;

  const { kana, confusions } = data.progress;
  return {
    kana: isObject(kana) ? validKana(kana) : {},
    confusions: Array.isArray(confusions) ? confusions.filter(isConfusion) : [],
  };
}

function validKana(saved: Record<string, unknown>): Record<string, KanaProgress> {
  const result: Record<string, KanaProgress> = {};
  for (const [char, value] of Object.entries(saved)) {
    if (isKanaProgress(value)) result[char] = value;
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

function isConfusion(value: unknown): value is Confusion {
  return isObject(value) && typeof value.shown === 'string' && typeof value.guessed === 'string';
}
