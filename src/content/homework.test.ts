import { HOMEWORK_DECKS, homeworkCard, homeworkDeck } from './homework';

describe('the homework decks', () => {
  it('has HW1, its twelve words in order, every card in it', () => {
    expect(HOMEWORK_DECKS.map((d) => [d.id, d.title, d.ids.length])).toEqual([['hw1', 'HW1', 12]]);
    const words = homeworkDeck('hw1')!.ids.map((id) => homeworkCard(id)!);
    expect(words.map((w) => w.word)).toEqual([
      '新しい', '紹介します', '自己紹介', 'お願いします', '先月', '来ました',
      'まだまだです', '同じ', 'わかりました', 'ご出身', '有名', 'ごゆっくり',
    ]);
    expect(words.map((w) => w.reading)).toEqual([
      'あたらしい', 'しょうかいします', 'じこしょうかい', 'おねがいします', 'せんげつ', 'きました',
      'まだまだです', 'おなじ', 'わかりました', 'ごしゅっしん', 'ゆうめい', 'ごゆっくり',
    ]);
    expect(words[9]!.meanings).toEqual(['hometown / place of origin']);
  });
});
