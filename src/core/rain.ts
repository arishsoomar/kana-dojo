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
};

export type RainState = {
  drops: Drop[];
  nextId: number;
  sinceSpawn: number; // milliseconds since the last kana appeared
};

export const RAIN_FALL_MS = 9000; // how long a kana takes to fall the whole way
export const RAIN_SPAWN_MS = 1600; // a new kana appears this often
export const RAIN_LANES = 5;

// A new kana won't start in a lane where another is still above this height,
// so two kana never overlap.
const LANE_CLEAR_Y = 0.2;

export function startRain(): RainState {
  // Starts "due" to spawn, so the first kana appears straight away.
  return { drops: [], nextId: 0, sinceSpawn: RAIN_SPAWN_MS };
}

// Moves the rain forward by `ms` milliseconds. Returns the new state and the kana
// that reached the ground during this step.
export function stepRain(
  state: RainState,
  ms: number,
  pool: readonly Kana[],
  rng: Rng,
): { state: RainState; landed: Drop[] } {
  const moved = state.drops.map((drop) => ({ ...drop, y: drop.y + ms / RAIN_FALL_MS }));
  const landed = moved.filter((drop) => drop.y >= 1);
  let drops = moved.filter((drop) => drop.y < 1);

  let { nextId, sinceSpawn } = state;
  sinceSpawn += ms;
  while (sinceSpawn >= RAIN_SPAWN_MS && pool.length > 0) {
    sinceSpawn -= RAIN_SPAWN_MS;
    const busy = new Set(drops.filter((d) => d.y < LANE_CLEAR_Y).map((d) => d.lane));
    const free = Array.from({ length: RAIN_LANES }, (_, lane) => lane).filter((lane) => !busy.has(lane));
    if (free.length === 0) continue;

    // Safe: both indexes are within their (non-empty) lists.
    const lane = free[Math.floor(rng() * free.length)]!;
    const kana = pool[Math.floor(rng() * pool.length)]!;
    drops = [...drops, { id: nextId, kana, lane, y: 0 }];
    nextId += 1;
  }

  return { state: { drops, nextId, sinceSpawn }, landed };
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

function clear(state: RainState, drop: Drop): RainState {
  return { ...state, drops: state.drops.filter((d) => d.id !== drop.id) };
}

// Applies one key press. `typed` is what was typed before this key.
export function typeKey(state: RainState, typed: string, key: string): TypeResult {
  const before = typed.toLowerCase();

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
