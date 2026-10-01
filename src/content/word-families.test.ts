import { REGISTERS } from './registers';
import { VOCAB } from './vocab';
import { WORD_FAMILIES } from './word-families';

describe('word families', () => {
  const deck = new Map(VOCAB.map((w) => [w.word, w]));

  it('each have their own id, and at least two words from the deck', () => {
    expect(new Set(WORD_FAMILIES.map((f) => f.id)).size).toBe(WORD_FAMILIES.length);
    for (const f of WORD_FAMILIES) expect(f.members.filter((m) => deck.has(m.word)).length).toBeGreaterThanOrEqual(2);
  });

  it('give each word its reading in kana, matching the deck where the word is in it', () => {
    for (const f of WORD_FAMILIES) {
      for (const m of f.members) {
        expect(m.reading).toMatch(/^[぀-ヿー]+$/);
        const card = VOCAB.find((w) => w.word === m.word && w.reading === m.reading);
        if (deck.has(m.word) && !card) throw new Error(`${m.word} is in the deck, but not read ${m.reading}`);
      }
      expect(new Set(f.members.map((m) => m.word)).size).toBe(f.members.length);
    }
  });

  it('names every label the deck uses', () => {
    const used = new Set(VOCAB.flatMap((w) => w.labels));
    expect([...used].filter((l) => !REGISTERS[l])).toEqual([]);
  });
});
