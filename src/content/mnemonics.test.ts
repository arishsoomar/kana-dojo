import { MNEMONIC_PICTURES } from '@/constants/mnemonic-pictures';

import { genkiCard } from './genki';
import { homeworkCard, homeworkDeck } from './homework';
import { mnemonicFor, WORD_MNEMONICS } from './mnemonics';
import { romajiOf } from './romaji';

const cardOf = (id: string) => homeworkCard(id) ?? genkiCard(id);

describe('the word mnemonics', () => {
  it('are for cards that exist, every HW1 card among them', () => {
    for (const id of Object.keys(WORD_MNEMONICS)) expect([id, cardOf(id)]).not.toEqual([id, null]);
    for (const id of homeworkDeck('hw1')!.ids) expect(WORD_MNEMONICS[id]).toBeDefined();
  });

  it('each has its scene picture, and no other pictures are left over', () => {
    expect(Object.keys(MNEMONIC_PICTURES).sort()).toEqual(Object.keys(WORD_MNEMONICS).sort());
  });

  it('end each tip with how its card spells the word', () => {
    for (const [id, m] of Object.entries(WORD_MNEMONICS)) expect([id, m.tip.endsWith(`: ${romajiOf(cardOf(id)!)}.`)]).toEqual([id, true]);
  });

  it('give no two different words the same keyword', () => {
    const wordOf = new Map<string, string>();
    for (const [id, m] of Object.entries(WORD_MNEMONICS)) {
      if (!m.keyword) continue;
      const card = cardOf(id)!;
      const key = m.keyword.toLowerCase();
      const word = `${card.word}|${card.reading}`;
      expect([m.keyword, wordOf.get(key) ?? word]).toEqual([m.keyword, word]);
      wordOf.set(key, word);
    }
  });

  it('give a word the same mnemonic in every deck it is in', () => {
    expect(mnemonicFor('1451750')).toEqual(mnemonicFor('hw1:onaji'));
  });

  it('has none for a card without one', () => {
    expect(mnemonicFor('number:21')).toBeNull();
    expect(mnemonicFor(null)).toBeNull();
    expect(mnemonicFor('hw1:onaji')!.keyword).toBe('own a jeep');
  });
});
