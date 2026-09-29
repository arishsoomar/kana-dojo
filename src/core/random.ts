// A source of random numbers from 0 (inclusive) to 1 (exclusive), like Math.random.
// The app passes Math.random; tests pass a fake that returns fixed values.
export type Rng = () => number;

// Returns a shuffled copy of `items` (Fisher–Yates). The input is not changed.
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    // Safe: i and j are both valid indexes into result.
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

// A source of random-looking numbers that always runs the same way for the same seed, so
// everyone who uses one seed (like a date) gets the same "random" choices. The seed is turned
// into a number (FNV-1a hash), then each call steps Mulberry32, a small, well-spread generator.
export function seededRng(seed: string): Rng {
  let state = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    state = Math.imul(state ^ seed.charCodeAt(i), 0x01000193);
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
