import { GENKI_DECKS } from './genki';
import { romajiOf } from './romaji';
import { VOCAB } from './vocab';

const word = (written: string) => VOCAB.find((w) => w.word === written)!;

describe('how a word is said, in romaji', () => {
  it('gives every GENKI word one', () => {
    const ids = new Set(GENKI_DECKS.flatMap((d) => d.ids));
    expect(VOCAB.filter((w) => ids.has(String(w.id)) && !romajiOf(w)).map((w) => w.word)).toEqual([]);
  });

  it('spaces the words of a phrase, and reads は as wa', () => {
    expect(romajiOf(word('おはようございます'))).toBe('ohayō gozaimasu');
    expect(romajiOf(word('こんにちは'))).toBe('konnichiwa');
    expect(romajiOf(word('男の人'))).toBe('otoko no hito');
  });

  it("works the rest out from the reading, keeping a verb's final う", () => {
    expect(romajiOf(word('高校'))).toBe('kōkō');
    expect(romajiOf(word('思う'))).toBe('omou');
    expect(romajiOf(word('湖'))).toBe('mizuumi');
  });
});
