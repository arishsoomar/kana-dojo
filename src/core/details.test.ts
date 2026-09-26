import { EMPTY_PROGRESS, type Progress } from './answers';
import { kanaDetails } from './details';
import { KANA, type Kana } from './kana';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

describe('kanaDetails', () => {
  const progress: Progress = {
    ...EMPTY_PROGRESS,
    kana: { し: { box: 7, at: 1 } },
    confusions: [
      { shown: 'し', guessed: 'ち' },
      { shown: 'ち', guessed: 'し' },
      { shown: 'し', guessed: 'ち' },
      { shown: 'し', guessed: 'つ' },
      { shown: 'か', guessed: 'き' },
    ],
    stats: { し: { seen: 8, correct: 7, recentMs: [1200, 1600, 1400] } },
  };

  it('reports belt, accuracy, strike speed, and what the next belt takes', () => {
    const details = kanaDetails(progress, kana('し'));
    expect(details.belt).toBe('brown');
    expect(details.accuracy).toBeCloseTo(7 / 8);
    expect(details.strikeSpeedMs).toBe(1400);
    // Box 7: two more steps to black, each a right answer under 1.5s tapped or 3s typed.
    expect(details.nextBelt).toEqual({ belt: 'black', steps: 2, tapMs: 1500, typeMs: 3000 });
  });

  it('has no next belt at black', () => {
    const black: Progress = { ...EMPTY_PROGRESS, kana: { し: { box: 9, at: 1 } } };
    expect(kanaDetails(black, kana('し')).nextBelt).toBeNull();
  });

  it('counts mix-ups in both directions, most frequent first', () => {
    expect(kanaDetails(progress, kana('し')).mixUps).toEqual([
      { char: 'ち', count: 3 },
      { char: 'つ', count: 1 },
    ]);
  });

  it('has no accuracy or speed for a kana never answered', () => {
    const details = kanaDetails(progress, kana('あ'));
    expect(details.accuracy).toBeNull();
    expect(details.strikeSpeedMs).toBeNull();
    expect(details.nextBelt).toEqual({ belt: 'green', steps: 3, tapMs: 4000, typeMs: 6000 });
    expect(details.mixUps).toEqual([]);
  });
});
