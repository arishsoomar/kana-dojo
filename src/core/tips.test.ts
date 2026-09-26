import { KANA, rowKind } from './kana';
import { kanaTip, mnemonicBase } from './tips';

describe('kanaTip', () => {
  it('has a memory tip for every kana', () => {
    const missing = KANA.filter((k) => !kanaTip(k.char)).map((k) => k.char);
    expect(missing).toEqual([]);
  });

  it("mentions each kana's sound, so the picture leads back to the answer", () => {
    const unlinked = KANA.filter((k) => !kanaTip(k.char)?.includes(k.romaji[0])).map((k) => k.char);
    expect(unlinked).toEqual([]);
  });

  it('is null for something that is not a kana', () => {
    expect(kanaTip('x')).toBeNull();
  });
});

describe('mnemonicBase', () => {
  const char = (c: string) => mnemonicBase(KANA.find((k) => k.char === c)!).char;

  it('is the kana itself for a basic kana', () => {
    expect(char('か')).toBe('か');
    expect(char('ン')).toBe('ン');
  });

  it('is the plain kana under a dakuten or handakuten', () => {
    expect(char('が')).toBe('か');
    expect(char('ぢ')).toBe('ち');
    expect(char('ポ')).toBe('ホ');
  });

  it('is the big kana of a yōon or extended katakana, and its plain kana', () => {
    expect(char('きゃ')).toBe('き');
    expect(char('ぎょ')).toBe('き');
    expect(char('ファ')).toBe('フ');
    expect(char('ディ')).toBe('テ');
    expect(char('ジェ')).toBe('シ');
  });

  it('always lands on one of the 46 basic kana of the same script', () => {
    for (const kana of KANA) {
      const base = mnemonicBase(kana);
      expect(rowKind(base.row)).toBe('basic');
      expect(base.script).toBe(kana.script);
    }
  });
});
