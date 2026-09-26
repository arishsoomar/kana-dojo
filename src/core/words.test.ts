import { KANA, type Kana } from './kana';
import { forgeWord, readTyped, wordRomaji } from './forge';
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
  it('writes every word with kana the app teaches (and っ or ー), all in one script', () => {
    const broken = WORDS.filter((w) => {
      const found = forgeWord(w);
      return found === null || new Set(found.units.map((k) => k.script)).size !== 1;
    });
    expect(broken.map((w) => w.text)).toEqual([]);
  });

  it("accepts each word's own romaji when it's typed", () => {
    const rejected = WORDS.filter((w) => {
      const found = forgeWord(w);
      return !found || !readTyped(found, wordRomaji(found.parts)).correct;
    });
    expect(rejected.map((w) => w.text)).toEqual([]);
  });

  it("reads each word's romaji back as the same kana, so it can't be taken two ways", () => {
    // Only words without っ or ー: those marks can't be read back from romaji on their own.
    const ambiguous = WORDS.filter((w) => {
      const found = forgeWord(w);
      if (!found || found.parts.length !== found.units.length) return false;
      return readBack(wordRomaji(found.parts), found.script) !== w.text;
    });
    expect(ambiguous.map((w) => w.text)).toEqual([]);
  });

  it('lists each word once, with a meaning and a picture', () => {
    expect(new Set(WORDS.map((w) => w.text)).size).toBe(WORDS.length);
    expect(WORDS.every((w) => w.meaning.length > 0)).toBe(true);
    expect(WORDS.every((w) => w.picture.length > 0)).toBe(true);
  });

  it('has words in both scripts', () => {
    const scripts = new Set(WORDS.map((w) => forgeWord(w)?.script));
    expect(scripts).toEqual(new Set(['hiragana', 'katakana']));
  });
});
