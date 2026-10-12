import { GENKI_CARDS } from '@/content/genki';

import { VOCAB_PICTURES } from './vocab-pictures';

const pictureOf = (w: (typeof GENKI_CARDS)[number]) => VOCAB_PICTURES[`${w.word}#${w.id}`] ?? VOCAB_PICTURES[w.word];

describe('flashcard pictures', () => {
  // By how a word is written, so both readings of 何 (なに, なん) get its picture; word#id picks
  // one of two cards written alike.
  it('pictures only words on the cards', () => {
    const words = new Set(GENKI_CARDS.map((w) => w.word));
    expect(Object.keys(VOCAB_PICTURES).filter((key) => !words.has(key.split('#')[0]!))).toEqual([]);
  });

  it('pictures every GENKI card', () => {
    expect(GENKI_CARDS.filter((w) => !pictureOf(w)).map((w) => w.word)).toEqual([]);
  });

  it('gives the two いる cards (to be, to need) different pictures', () => {
    const iru = GENKI_CARDS.filter((w) => w.word === 'いる');
    expect(iru).toHaveLength(2);
    expect(pictureOf(iru[0]!)).not.toBe(pictureOf(iru[1]!));
  });
});
