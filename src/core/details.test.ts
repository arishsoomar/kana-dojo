import type { Progress } from './answers';
import { formatWait, kanaDetails } from './details';
import { KANA, type Kana } from './kana';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

const NOW = 1_000_000;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('kanaDetails', () => {
  const progress: Progress = {
    kana: { し: { box: 5, dueAt: NOW + 2 * DAY } },
    confusions: [
      { shown: 'し', guessed: 'ち' },
      { shown: 'ち', guessed: 'し' },
      { shown: 'し', guessed: 'ち' },
      { shown: 'し', guessed: 'つ' },
      { shown: 'か', guessed: 'き' },
    ],
    stats: { し: { seen: 8, correct: 7, recentMs: [1200, 1600, 1400] } },
  };

  it('reports belt, accuracy, strike speed and time until the next drill', () => {
    const details = kanaDetails(progress, kana('し'), NOW);
    expect(details.belt).toBe('brown');
    expect(details.accuracy).toBeCloseTo(7 / 8);
    expect(details.strikeSpeedMs).toBe(1400);
    expect(details.dueInMs).toBe(2 * DAY);
  });

  it('counts mix-ups in both directions, most frequent first', () => {
    expect(kanaDetails(progress, kana('し'), NOW).mixUps).toEqual([
      { char: 'ち', count: 3 },
      { char: 'つ', count: 1 },
    ]);
  });

  it('has no accuracy or speed for a kana never answered', () => {
    const details = kanaDetails(progress, kana('あ'), NOW);
    expect(details.accuracy).toBeNull();
    expect(details.strikeSpeedMs).toBeNull();
    expect(details.dueInMs).toBe(0);
    expect(details.mixUps).toEqual([]);
  });
});

describe('formatWait', () => {
  it('says "Now" once something is due', () => {
    expect(formatWait(0)).toBe('Now');
    expect(formatWait(-5 * MINUTE)).toBe('Now');
  });

  it('rounds up to minutes, hours, or days', () => {
    expect(formatWait(30_000)).toBe('1 min');
    expect(formatWait(20 * MINUTE)).toBe('20 min');
    expect(formatWait(6 * HOUR)).toBe('6 hours');
    expect(formatWait(1 * HOUR)).toBe('1 hour');
    expect(formatWait(2 * DAY)).toBe('2 days');
    expect(formatWait(1 * DAY)).toBe('1 day');
  });
});
