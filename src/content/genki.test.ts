import { furiganaText } from '@/core/vocab';

import { GENKI_CARDS, GENKI_DECKS, genkiCard, genkiDeck } from './genki';

const words = (deck: string) => genkiDeck(deck)!.ids.map((id) => genkiCard(id)!.word);

describe('the GENKI decks', () => {
  it('has a deck for each lesson, before lesson 1 to lesson 12, of 50 or more cards each', () => {
    expect(GENKI_DECKS.map((d) => d.lesson)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const deck of GENKI_DECKS) {
      expect(deck.ids.length).toBeGreaterThanOrEqual(45);
      expect(new Set(deck.ids).size).toBe(deck.ids.length);
      expect(deck.ids.filter((id) => genkiCard(id) === null)).toEqual([]);
    }
  });

  it("has the book's words, suffixes and phrases too, in the book's order", () => {
    expect(words('genki-1')).toEqual(expect.arrayContaining(['～さん', '一時', '二時半', '～年生', '～歳', 'そうですか']));
    expect(words('genki-1')[0]).toBe('大学');
    expect(words('genki-0').slice(-3)).toEqual(['八十', '九十', '百']);
    expect(words('genki-12').at(-1)).toBe('同じ');
  });

  it("gives each card the book's English, and furigana that spell its word", () => {
    const card = genkiCard(genkiDeck('genki-1')!.ids.find((id) => genkiCard(id)!.word === '～さん')!)!;
    expect(card.meanings).toEqual(['Mr./Ms. ...']);
    expect(card.reading).toBe('さん');
    expect(GENKI_CARDS.filter((w) => furiganaText(w.furigana) !== w.word).map((w) => w.word)).toEqual([]);
    expect(GENKI_CARDS.filter((w) => !w.meanings[0]?.trim() || !w.reading).map((w) => w.word)).toEqual([]);
  });

  it('keeps another meaning or reading of a word apart: 聞く to listen, then to ask; 四 よん and し', () => {
    const listen = words('genki-3').indexOf('聞く');
    const ask = words('genki-5').indexOf('聞く');
    expect(genkiDeck('genki-3')!.ids[listen]).not.toBe(genkiDeck('genki-5')!.ids[ask]);
    expect(genkiDeck('genki-0')!.ids.filter((id) => genkiCard(id)!.word === '四')).toHaveLength(2);
  });
});
