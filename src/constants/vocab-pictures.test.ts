import { VOCAB } from '@/content/vocab';

import { VOCAB_PICTURES } from './vocab-pictures';

describe('word deck pictures', () => {
  // By how a word is written, so both readings of 何 (なに, なん) get its picture.
  it('pictures only words in the deck', () => {
    const notInDeck = Object.keys(VOCAB_PICTURES).filter((word) => !VOCAB.some((w) => w.word === word));
    expect(notInDeck).toEqual([]);
  });

  it('pictures most of GENKI I before lesson 1 and lesson 1', () => {
    const first = VOCAB.filter((w) => w.genki === 0 || w.genki === 1);
    expect(first.filter((w) => VOCAB_PICTURES[w.word]).length).toBeGreaterThan(first.length * 0.7);
  });
});
