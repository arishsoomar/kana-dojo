import { EMPTY_PROGRESS, type Progress } from './answers';
import type { Script } from './kana';
import { greenNeeded, nextPromotionAt, unlockedKana } from './unlock';

// Progress where every listed kana is in `box`.
function withBox(chars: string[], box: number): Progress {
  return {
    ...EMPTY_PROGRESS,
    kana: Object.fromEntries(chars.map((char) => [char, { box, dueAt: 0 }])),
  };
}

function charsOf(progress: Progress, script: Script): string[] {
  return unlockedKana(progress, script).map((k) => k.char);
}

describe('unlockedKana', () => {
  it('starts with only the a row', () => {
    expect(charsOf(withBox([], 0), 'hiragana')).toEqual(['あ', 'い', 'う', 'え', 'お']);
  });

  it('opens the next row when 4 of 5 are green', () => {
    const unlocked = charsOf(withBox(['あ', 'い', 'う', 'え'], 3), 'hiragana');
    expect(unlocked).toHaveLength(10);
    expect(unlocked).toContain('か');
  });

  it('keeps the next row locked at 3 of 5', () => {
    expect(charsOf(withBox(['あ', 'い', 'う'], 3), 'hiragana')).toHaveLength(5);
  });

  it('unlocks each script separately', () => {
    expect(charsOf(withBox(['あ', 'い', 'う', 'え', 'お'], 3), 'katakana')).toHaveLength(5);
  });
});

describe('greenNeeded', () => {
  it('counts how many more kana in a row must reach green to open the next row', () => {
    expect(greenNeeded(withBox([], 0), 'hiragana', 'a')).toBe(4);
    expect(greenNeeded(withBox(['あ', 'い'], 3), 'hiragana', 'a')).toBe(2);
    expect(greenNeeded(withBox(['あ', 'い', 'う', 'え'], 3), 'hiragana', 'a')).toBe(0);
  });

  it('needs all 3 in a 3-kana row', () => {
    expect(greenNeeded(withBox([], 0), 'hiragana', 'ya')).toBe(3);
  });
});

describe('nextPromotionAt', () => {
  const progress: Progress = {
    ...EMPTY_PROGRESS,
    kana: {
      あ: { box: 3, dueAt: 100 }, // green already: doesn't count
      い: { box: 2, dueAt: 900 },
      う: { box: 1, dueAt: 500 },
      え: { box: 4, dueAt: 0 },
      お: { box: 3, dueAt: 0 },
    },
  };

  it('is the soonest time a kana below green belt can move up', () => {
    expect(nextPromotionAt(progress, 'hiragana', 'a')).toBe(500);
  });

  it('is 0 when a kana below green has never been answered (it is due now)', () => {
    const { お: _unanswered, ...rest } = progress.kana;
    expect(nextPromotionAt({ ...progress, kana: rest }, 'hiragana', 'a')).toBe(0);
  });

  it('is null when every kana in the row is green or better', () => {
    expect(nextPromotionAt(withBox(['あ', 'い', 'う', 'え', 'お'], 3), 'hiragana', 'a')).toBeNull();
  });
});
