import type { Progress } from './answers';
import type { Script } from './kana';
import { unlockedKana } from './unlock';

// Progress where every listed kana is in `box`.
function withBox(chars: string[], box: number): Progress {
  return {
    kana: Object.fromEntries(chars.map((char) => [char, { box, dueAt: 0 }])),
    confusions: [],
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
