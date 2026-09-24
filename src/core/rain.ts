import type { Kana } from './kana';
import type { Rng } from './random';

// Kana Rain: kana fall from the top of the play area and are removed when they reach the
// ground. Positions are fractions of the play area, so the engine doesn't care about pixels:
// y goes from 0 (top) to 1 (ground), and lanes split the width into equal columns.

export type Drop = {
  id: number;
  kana: Kana;
  lane: number; // 0 to RAIN_LANES - 1, left to right
  y: number; // 0 at the top, 1 at the ground
  age: number; // milliseconds since it appeared; times the answer when it's cleared
};

export type RainState = {
  drops: Drop[];
  nextId: number;
  sinceSpawn: number; // milliseconds since the last kana appeared
  score: number;
  lives: number;
  cleared: number; // kana cleared so far; sets the wave
  over: boolean; // true once the last life is lost
};

export const RAIN_FALL_MS = 9000; // how long a kana takes to fall the whole way, in wave 1
export const RAIN_SPAWN_MS = 1600; // how often a new kana appears, in wave 1
export const RAIN_LANES = 5;
export const RAIN_LIVES = 3;

// Every KANA_PER_WAVE kana cleared starts a new wave. Each wave falls and spawns
// WAVE_SPEEDUP times as long as the last (so 10% faster), but never faster than the limits.
const KANA_PER_WAVE = 10;
const WAVE_SPEEDUP = 0.9;
const FASTEST_FALL_MS = 3500;
const FASTEST_SPAWN_MS = 700;

export function waveOf(cleared: number): number {
  return 1 + Math.floor(cleared / KANA_PER_WAVE);
}

export function rainPace(wave: number): { fallMs: number; spawnMs: number } {
  const factor = WAVE_SPEEDUP ** (wave - 1);
  return {
    fallMs: Math.max(RAIN_FALL_MS * factor, FASTEST_FALL_MS),
    spawnMs: Math.max(RAIN_SPAWN_MS * factor, FASTEST_SPAWN_MS),
  };
}

// Points for clearing a kana at height y: 10, plus up to 30 more the higher it still was.
const BASE_POINTS = 10;
const HEIGHT_POINTS = 30;

export function pointsFor(y: number): number {
  return BASE_POINTS + Math.round(HEIGHT_POINTS * (1 - Math.min(Math.max(y, 0), 1)));
}

// A new kana won't start in a lane where another is still above this height,
// so two kana never overlap.
const LANE_CLEAR_Y = 0.2;

export function startRain(): RainState {
  // Starts "due" to spawn, so the first kana appears straight away.
  return { drops: [], nextId: 0, sinceSpawn: RAIN_SPAWN_MS, score: 0, lives: RAIN_LIVES, cleared: 0, over: false };
}

// Moves the rain forward by `ms` milliseconds. `nextKana` chooses each new kana (the app
// passes the learning engine's pickNext; null means none right now). Returns the new state
// and the kana that reached the ground during this step. Each landing costs a life; once
// the game is over, nothing changes.
export function stepRain(
  state: RainState,
  ms: number,
  nextKana: () => Kana | null,
  rng: Rng,
): { state: RainState; landed: Drop[] } {
  if (state.over) return { state, landed: [] };

  const { fallMs, spawnMs } = rainPace(waveOf(state.cleared));
  const moved = state.drops.map((drop) => ({ ...drop, y: drop.y + ms / fallMs, age: drop.age + ms }));
  const landed = moved.filter((drop) => drop.y >= 1);
  let drops = moved.filter((drop) => drop.y < 1);

  const lives = Math.max(state.lives - landed.length, 0);
  if (lives === 0) {
    return { state: { ...state, drops, lives, over: true }, landed };
  }

  let { nextId, sinceSpawn } = state;
  sinceSpawn += ms;
  while (sinceSpawn >= spawnMs) {
    sinceSpawn -= spawnMs;
    const busy = new Set(drops.filter((d) => d.y < LANE_CLEAR_Y).map((d) => d.lane));
    const free = Array.from({ length: RAIN_LANES }, (_, lane) => lane).filter((lane) => !busy.has(lane));
    if (free.length === 0) continue;

    const kana = nextKana();
    if (!kana) continue;

    // Safe: the index is within the (non-empty) list of free lanes.
    const lane = free[Math.floor(rng() * free.length)]!;
    drops = [...drops, { id: nextId, kana, lane, y: 0, age: 0 }];
    nextId += 1;
  }

  return { state: { ...state, drops, nextId, sinceSpawn, lives }, landed };
}

// Keys that mean "take what I've typed as my answer", for "n" when な could still be meant.
const SUBMIT_KEYS = new Set(['Enter', ' ']);

function spellings(drop: Drop): readonly string[] {
  return drop.kana.romaji;
}

// The lowest (closest to landing) of `drops`, or null if there are none.
function lowest(drops: readonly Drop[]): Drop | null {
  return drops.reduce<Drop | null>((low, drop) => (low === null || drop.y > low.y ? drop : low), null);
}

// The kana the player is locked on to: the lowest one whose romaji starts with `typed`.
export function targetOf(drops: readonly Drop[], typed: string): Drop | null {
  const text = typed.toLowerCase();
  if (text === '') return null;
  return lowest(drops.filter((d) => spellings(d).some((r) => r.startsWith(text))));
}

export type TypeResult = {
  state: RainState;
  typed: string; // what the typing bar should now show
  cleared: Drop | null; // the kana this key cleared, if any
  rejected: boolean; // the key couldn't match anything, so it was ignored
};

// Removes a cleared kana and scores it.
function clear(state: RainState, drop: Drop): RainState {
  return {
    ...state,
    drops: state.drops.filter((d) => d.id !== drop.id),
    score: state.score + pointsFor(drop.y),
    cleared: state.cleared + 1,
  };
}

// Applies one key press. `typed` is what was typed before this key.
export function typeKey(state: RainState, typed: string, key: string): TypeResult {
  const before = typed.toLowerCase();
  if (state.over) return { state, typed: before, cleared: null, rejected: true };

  if (SUBMIT_KEYS.has(key)) {
    const exact = lowest(state.drops.filter((d) => spellings(d).includes(before)));
    return exact
      ? { state: clear(state, exact), typed: '', cleared: exact, rejected: false }
      : { state, typed: before, cleared: null, rejected: false };
  }

  const text = before + key.toLowerCase();
  const matching = state.drops.filter((d) => spellings(d).some((r) => r.startsWith(text)));
  if (matching.length === 0) return { state, typed: before, cleared: null, rejected: true };

  const exact = lowest(matching.filter((d) => spellings(d).includes(text)));
  // Wait if a longer spelling could still be meant ("n" when な is falling).
  const longerPossible = matching.some((d) => spellings(d).some((r) => r.length > text.length && r.startsWith(text)));
  if (exact && !longerPossible) {
    return { state: clear(state, exact), typed: '', cleared: exact, rejected: false };
  }
  return { state, typed: text, cleared: null, rejected: false };
}
