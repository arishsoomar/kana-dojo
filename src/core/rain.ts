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
