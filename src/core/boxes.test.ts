import { MAX_BOX, tierOf } from './boxes';

describe('tierOf', () => {
  it('maps boxes 0–9 to belts, three steps to a belt', () => {
    const belts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(tierOf);
    expect(belts).toEqual([
      'white', 'white', 'white',
      'green', 'green', 'green',
      'brown', 'brown', 'brown',
      'black',
    ]);
  });

  it('tops out at black', () => {
    expect(MAX_BOX).toBe(9);
  });
});
