import { GENKI_CARDS, genkiCard, genkiDeck } from '@/content/genki';

import { VOCAB_PICTURES } from './vocab-pictures';

describe('flashcard pictures', () => {
  // By how a word is written, so both readings of 何 (なに, なん) get its picture.
  it('pictures only words on the cards', () => {
    const words = new Set(GENKI_CARDS.map((w) => w.word));
    expect(Object.keys(VOCAB_PICTURES).filter((word) => !words.has(word))).toEqual([]);
  });

  it('pictures every card before lesson 1 and in lesson 1', () => {
    const first = ['genki-0', 'genki-1'].flatMap((d) => genkiDeck(d)!.ids.map((id) => genkiCard(id)!.word));
    expect(first.filter((word) => !VOCAB_PICTURES[word])).toEqual([]);
  });
});
