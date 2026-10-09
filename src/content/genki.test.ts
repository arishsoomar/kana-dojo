import { VOCAB } from './vocab';

import { GENKI_DECKS, genkiDeck } from './genki';

describe('the GENKI decks', () => {
  it('has a deck for each lesson, before lesson 1 to lesson 12, each of words in the deck', () => {
    expect(GENKI_DECKS.map((d) => d.lesson)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const ids = new Set(VOCAB.map((w) => String(w.id)));
    for (const deck of GENKI_DECKS) {
      expect(deck.ids.length).toBeGreaterThan(20);
      expect(deck.ids.filter((id) => !ids.has(id))).toEqual([]);
    }
  });

  it("keeps each lesson's order: the greetings first, then the numbers from zero up", () => {
    const words = genkiDeck('genki-0')!.ids.map((id) => VOCAB.find((w) => String(w.id) === id)!.word);
    expect(words[0]).toBe('おはよう');
    expect(words.slice(-11)).toEqual(['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']);
    expect(genkiDeck('genki-99')).toBeNull();
  });
});
