import { intervalFor, isDue, tierOf, type KanaProgress } from './boxes';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('tierOf', () => {
  it('maps boxes 0–7 to belts', () => {
    const belts = [0, 1, 2, 3, 4, 5, 6, 7].map(tierOf);
    expect(belts).toEqual([
      'white', 'white', 'white',
      'green', 'green',
      'brown', 'brown',
      'black',
    ]);
  });
});

describe('intervalFor', () => {
  it('matches the Leitner schedule, in milliseconds, with no wait below green belt', () => {
    const intervals = [0, 1, 2, 3, 4, 5, 6, 7].map(intervalFor);
    expect(intervals).toEqual([
      0,
      0,
      0,
      20 * MINUTE,
      6 * HOUR,
      2 * DAY,
      7 * DAY,
      21 * DAY,
    ]);
  });
});

describe('isDue', () => {
  const progress: KanaProgress = { box: 2, dueAt: 1_000_000 };

  it('is not due before its due time', () => {
    expect(isDue(progress, 999_999)).toBe(false);
  });

  it('is due exactly at its due time', () => {
    expect(isDue(progress, 1_000_000)).toBe(true);
  });

  it('is due after its due time', () => {
    expect(isDue(progress, 1_000_000 + DAY)).toBe(true);
  });
});
