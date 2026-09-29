import { forgeWord } from '@/core/forge';
import { phraseRomaji, SIGN_OPTIONS } from '@/core/reading';

import { PHRASES } from './phrases';

describe('the phrases', () => {
  it('writes every word with kana the app teaches (and っ or ー), each word in one script', () => {
    // A particle is always hiragana, even after a katakana word (トイレは), so it's left out here.
    const words = PHRASES.flatMap((p) => p.text.replace(/\[.*?\]/g, '').split(' ')).filter(Boolean);
    const broken = words.filter((word) => {
      const found = forgeWord({ text: word, meaning: '', picture: '' });
      return found === null || new Set(found.units.map((k) => k.script)).size !== 1;
    });
    expect(broken).toEqual([]);
  });

  it('brackets only the particles は, へ and を', () => {
    const marks = PHRASES.flatMap((p) => [...p.text.matchAll(/\[(.*?)\]/g)].map((m) => m[1]));
    expect(marks.filter((m) => m !== 'は' && m !== 'へ' && m !== 'を')).toEqual([]);
  });

  it('can read every phrase aloud', () => {
    expect(PHRASES.filter((p) => phraseRomaji(p).some((piece) => piece.text === '')).map((p) => p.text)).toEqual([]);
  });

  it('gives every phrase its own meaning, and has enough for a round', () => {
    expect(new Set(PHRASES.map((p) => p.meaning)).size).toBe(PHRASES.length);
    expect(PHRASES.length).toBeGreaterThanOrEqual(SIGN_OPTIONS);
  });
});
