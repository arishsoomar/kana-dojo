import { seededRng, shuffle } from './random';

describe('shuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('keeps every item exactly once', () => {
    for (const value of [0, 0.5, 0.99]) {
      const result = shuffle(items, () => value);
      expect([...result].sort()).toEqual(items);
    }
  });

  it('gives the same order for the same random numbers', () => {
    expect(shuffle(items, () => 0.3)).toEqual(shuffle(items, () => 0.3));
  });

  it('does not change the list it was given', () => {
    shuffle(items, () => 0);
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('seededRng', () => {
  const take = (rng: () => number, n: number) => Array.from({ length: n }, () => rng());

  it('gives the same numbers for the same seed', () => {
    expect(take(seededRng('2026-09-28'), 10)).toEqual(take(seededRng('2026-09-28'), 10));
  });

  it('gives different numbers for different seeds', () => {
    expect(take(seededRng('2026-09-28'), 10)).not.toEqual(take(seededRng('2026-09-29'), 10));
  });

  it('gives numbers from 0 up to (not including) 1, spread across that range', () => {
    const values = take(seededRng('kata'), 1000);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(values.filter((v) => v < 0.5).length).toBeGreaterThan(400);
    expect(values.filter((v) => v < 0.5).length).toBeLessThan(600);
  });
});
