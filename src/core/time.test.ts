import { furiganaReading, furiganaText } from './vocab';
import { clockWord, hourWord, minuteWord } from './time';

describe('an hour as a word', () => {
  it('is the number with 時, read じ', () => {
    expect(hourWord(3).word).toBe('三時');
    expect(hourWord(3).reading).toBe('さんじ');
    expect(hourWord(12).reading).toBe('じゅうにじ');
    expect(hourWord(3).meanings).toEqual(['3:00']);
  });

  it('reads 4, 7 and 9 the old way: よじ, しちじ, くじ, and says so', () => {
    expect(hourWord(4).reading).toBe('よじ');
    expect(hourWord(7).reading).toBe('しちじ');
    expect(hourWord(9).reading).toBe('くじ');
    expect(hourWord(4).note).toMatch(/よんじ/);
    expect(hourWord(3).note).toBeNull();
  });
});

describe('minutes as a word', () => {
  it('is the number with 分, read ふん or ぷん by the sound before it', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => minuteWord(m).reading)).toEqual([
      'いっぷん',
      'にふん',
      'さんぷん',
      'よんぷん',
      'ごふん',
      'ろっぷん',
      'ななふん',
      'はっぷん',
      'きゅうふん',
      'じゅっぷん',
    ]);
    expect(minuteWord(10).word).toBe('十分');
  });

  it('goes by its last digit in bigger numbers', () => {
    expect(minuteWord(21).reading).toBe('にじゅういっぷん');
    expect(minuteWord(30).reading).toBe('さんじゅっぷん');
    expect(minuteWord(45).reading).toBe('よんじゅうごふん');
    expect(minuteWord(58).reading).toBe('ごじゅうはっぷん');
    expect(minuteWord(21).meanings).toEqual(['21 minutes']);
    expect(minuteWord(1).meanings).toEqual(['1 minute']);
  });

  it('notes the other reading of 8 and 10', () => {
    expect(minuteWord(8).note).toMatch(/はちふん/);
    expect(minuteWord(10).note).toMatch(/じっぷん/);
  });
});

describe('a clock time as a word', () => {
  it('is the hour and its minutes, or 半 for half past', () => {
    expect(clockWord(3, 15).word).toBe('三時十五分');
    expect(clockWord(3, 15).reading).toBe('さんじじゅうごふん');
    expect(clockWord(3, 15).meanings).toEqual(['3:15']);
    expect(clockWord(9, 5).meanings).toEqual(['9:05']);
    expect(clockWord(4, 30).word).toBe('四時半');
    expect(clockWord(4, 30).reading).toBe('よじはん');
    expect(clockWord(4, 30).note).toMatch(/よんじ/);
    expect(clockWord(2, 0).word).toBe('二時');
  });
});

describe('every time word', () => {
  it('has furigana that spell it and say it', () => {
    const all = [
      ...Array.from({ length: 12 }, (_, i) => hourWord(i + 1)),
      ...Array.from({ length: 59 }, (_, i) => minuteWord(i + 1)),
      ...Array.from({ length: 12 }, (_, i) => clockWord(i + 1, 45)),
    ];
    for (const w of all) {
      expect(furiganaText(w.furigana)).toBe(w.word);
      expect(furiganaReading(w.furigana)).toBe(w.reading);
    }
    expect(new Set(all.map((w) => w.reading)).size).toBe(all.length);
  });
});
