import { furiganaReading, furiganaText } from './vocab';
import { BIG_NUMBERS, numberWord, NUMBER_SETS } from './numbers';

describe('a number from 1 to 100 as a word', () => {
  it('is written in kanji with furigana for each one', () => {
    expect(numberWord(21).word).toBe('二十一');
    expect(numberWord(21).furigana).toEqual([
      ['二', 'に'],
      ['十', 'じゅう'],
      ['一', 'いち'],
    ]);
    expect(numberWord(10).word).toBe('十');
    expect(numberWord(15).word).toBe('十五');
    expect(numberWord(100).word).toBe('百');
  });

  it("is read the way it's usually said: よん, なな and きゅう in every 4, 7 and 9", () => {
    expect(numberWord(4).reading).toBe('よん');
    expect(numberWord(7).reading).toBe('なな');
    expect(numberWord(9).reading).toBe('きゅう');
    expect(numberWord(14).reading).toBe('じゅうよん');
    expect(numberWord(47).reading).toBe('よんじゅうなな');
    expect(numberWord(99).reading).toBe('きゅうじゅうきゅう');
    expect(numberWord(100).reading).toBe('ひゃく');
  });

  it('notes the other reading of 4, 7 and 9 on their own', () => {
    expect(numberWord(4).note).toMatch(/し/);
    expect(numberWord(7).note).toMatch(/しち/);
    expect(numberWord(9).note).toMatch(/く/);
    expect(numberWord(21).note).toBeNull();
  });

  it('means the number in digits, and its furigana spell it and say it', () => {
    for (let n = 1; n <= 100; n++) {
      const w = numberWord(n);
      expect(w.meanings).toEqual([String(n)]);
      expect(furiganaText(w.furigana)).toBe(w.word);
      expect(furiganaReading(w.furigana)).toBe(w.reading);
    }
  });

  it('gives every number its own word and reading', () => {
    const all = Array.from({ length: 100 }, (_, i) => numberWord(i + 1));
    expect(new Set(all.map((w) => w.word)).size).toBe(100);
    expect(new Set(all.map((w) => w.reading)).size).toBe(100);
  });
});

describe("GENKI's big numbers: hundreds, thousands and ten thousands", () => {
  it('are 100 to 900, 1,000 to 9,000 and 10,000 to 90,000', () => {
    expect(BIG_NUMBERS).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900,
      1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
      10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000,
    ]);
  });

  it('are written with 百, 千 and 万', () => {
    expect(numberWord(200).word).toBe('二百');
    expect(numberWord(1000).word).toBe('千');
    expect(numberWord(5000).word).toBe('五千');
    expect(numberWord(10000).word).toBe('一万');
    expect(numberWord(90000).word).toBe('九万');
  });

  it('are read with the sound changes GENKI marks', () => {
    const readings = BIG_NUMBERS.map((n) => numberWord(n).reading);
    expect(readings).toEqual([
      'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく',
      'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん',
      'いちまん', 'にまん', 'さんまん', 'よんまん', 'ごまん', 'ろくまん', 'ななまん', 'はちまん', 'きゅうまん',
    ]);
  });

  it('put each sound change in its furigana', () => {
    expect(numberWord(300).furigana).toEqual([
      ['三', 'さん'],
      ['百', 'びゃく'],
    ]);
    expect(numberWord(600).furigana).toEqual([
      ['六', 'ろっ'],
      ['百', 'ぴゃく'],
    ]);
    expect(numberWord(8000).furigana).toEqual([
      ['八', 'はっ'],
      ['千', 'せん'],
    ]);
  });

  it('note the sound changes, and that 10,000 is いちまん but 100 and 1,000 have no いち', () => {
    for (const n of [300, 600, 800, 3000, 8000, 100, 1000, 10000]) expect(numberWord(n).note).not.toBeNull();
    expect(numberWord(10000).note).toMatch(/いちまん/);
    for (const n of [200, 400, 700, 900, 2000, 5000, 20000, 80000]) expect(numberWord(n).note).toBeNull();
  });

  it('mean the number in digits, with commas from 1,000', () => {
    expect(numberWord(500).meanings).toEqual(['500']);
    expect(numberWord(1000).meanings).toEqual(['1,000']);
    expect(numberWord(30000).meanings).toEqual(['30,000']);
    for (const n of BIG_NUMBERS) {
      const w = numberWord(n);
      expect(furiganaText(w.furigana)).toBe(w.word);
      expect(furiganaReading(w.furigana)).toBe(w.reading);
    }
  });
});

describe('the number sets', () => {
  it('go by tens, 1 to 10 through 91 to 100, then all 100, then the big numbers by place and all together', () => {
    expect(NUMBER_SETS.map((s) => [s.numbers[0], s.numbers.at(-1), s.numbers.length])).toEqual([
      [1, 10, 10],
      [11, 20, 10],
      [21, 30, 10],
      [31, 40, 10],
      [41, 50, 10],
      [51, 60, 10],
      [61, 70, 10],
      [71, 80, 10],
      [81, 90, 10],
      [91, 100, 10],
      [1, 100, 100],
      [100, 900, 9],
      [1000, 9000, 9],
      [10000, 90000, 9],
      [100, 90000, 27],
    ]);
  });
});
