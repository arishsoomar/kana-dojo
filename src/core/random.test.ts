import { shuffle } from './random';

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
