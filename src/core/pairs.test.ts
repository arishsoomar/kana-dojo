import { KANA } from './kana';
import { NAMED_PAIRS, pairById, pairId } from './pairs';

function scriptOf(char: string) {
  return KANA.find((k) => k.char === char)?.script;
}

describe('NAMED_PAIRS', () => {
  it('pairs two different real kana from the same script', () => {
    for (const { kana } of NAMED_PAIRS) {
      const [a, b] = kana;
      expect(a).not.toBe(b);
      expect(scriptOf(a)).toBeDefined();
      expect(scriptOf(a)).toBe(scriptOf(b));
    }
  });

  it('lists each pair once, in either order', () => {
    const keys = NAMED_PAIRS.map(({ kana }) => [...kana].sort().join(''));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every pair a name and a tip that mentions both kana', () => {
    for (const { kana, name, tip } of NAMED_PAIRS) {
      expect(name.length).toBeGreaterThan(0);
      expect(tip).toContain(kana[0]);
      expect(tip).toContain(kana[1]);
    }
  });

  it('covers both scripts', () => {
    const scripts = new Set(NAMED_PAIRS.map(({ kana }) => scriptOf(kana[0])));
    expect(scripts).toEqual(new Set(['hiragana', 'katakana']));
  });
});

describe('pairId and pairById', () => {
  it("names a pair by its two kana, and finds it again from that name", () => {
    for (const pair of NAMED_PAIRS) {
      expect(pairById(pairId(pair))).toBe(pair);
    }
    expect(pairId(NAMED_PAIRS[0]!)).toBe('あお');
  });

  it('is null for an id that is not a named pair', () => {
    expect(pairById('あか')).toBeNull();
    expect(pairById('')).toBeNull();
  });
});
