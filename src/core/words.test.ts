import { KANA, type Kana } from './kana';
import { splitWord, wordRomaji } from './forge';
import { WORDS } from './words';

// Reads romaji back into kana the simple way, taking the longest spelling at each point.
function readBack(romaji: string, script: Kana['script']): string {
  const kana = KANA.filter((k) => k.script === script);
  let out = '';
  let at = 0;
  while (at < romaji.length) {
    const found = kana
      .flatMap((k) => k.romaji.map((spelling) => ({ k, spelling })))
      .filter(({ spelling }) => romaji.startsWith(spelling, at))
      .sort((a, b) => b.spelling.length - a.spelling.length)[0];
    if (!found) return `${out}?`;
    out += found.k.char;
    at += found.spelling.length;
  }
  return out;
}

describe('the word list', () => {
  it('writes every word with kana the app teaches, all in one script', () => {
    const broken = WORDS.filter((w) => {
      const units = splitWord(w.text);
      return units === null || new Set(units.map((k) => k.script)).size !== 1;
    });
    expect(broken.map((w) => w.text)).toEqual([]);
  });

  it("reads each word's romaji back as the same kana, so typing it can't be taken two ways", () => {
    const ambiguous = WORDS.filter((w) => {
      const units = splitWord(w.text) ?? [];
      return readBack(wordRomaji(units), units[0]?.script ?? 'hiragana') !== w.text;
    });
    expect(ambiguous.map((w) => w.text)).toEqual([]);
  });

  it('lists each word once, with a meaning', () => {
    expect(new Set(WORDS.map((w) => w.text)).size).toBe(WORDS.length);
    expect(WORDS.every((w) => w.meaning.length > 0)).toBe(true);
  });

  it('has words in both scripts', () => {
    const scripts = new Set(WORDS.map((w) => splitWord(w.text)?.[0]?.script));
    expect(scripts).toEqual(new Set(['hiragana', 'katakana']));
  });
});
