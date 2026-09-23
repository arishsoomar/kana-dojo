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
