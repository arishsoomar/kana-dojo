import { DEFAULT_NAME, parseRuby, rubyText, sayCardIds, sayJapanese, sayRomaji, type GrammarLesson } from './grammar';

const ARISH = { ja: 'アリシュ', en: 'Arish' };

describe('readings in lesson text', () => {
  it('puts a reading over the kanji just before it', () => {
    expect(parseRuby('私[わたし]は学生[がくせい]です。')).toEqual([['私', 'わたし'], ['は'], ['学生', 'がくせい'], ['です。']]);
    expect(rubyText('私[わたし]は')).toBe('私は');
  });
});

describe('a sentence to say', () => {
  it('is shown without the spaces between its words, with the learner’s name in it', () => {
    expect(sayJapanese('私[わたし] は {name} です。', ARISH)).toBe('私[わたし]はアリシュです。');
    expect(sayJapanese('私[わたし] は {name} です。', DEFAULT_NAME)).toBe('私[わたし]はメアリーです。');
  });

  it('is read in romaji word by word, は, へ and を as particles, the name as it is spelled', () => {
    expect(sayRomaji('私[わたし] は {name} です。', ARISH)).toBe('Watashi wa Arish desu.');
    expect(sayRomaji('学校[がっこう] へ 行[い]きます か？', ARISH)).toBe('Gakkō e ikimasu ka?');
    expect(sayRomaji('コーヒー を 飲[の]みます。', ARISH)).toBe('Kōhī o nomimasu.');
    expect(sayRomaji('はい、そう です。', ARISH)).toBe('Hai, sō desu.');
    expect(sayRomaji('たけし さん は 学生[がくせい] じゃ ない です。肉[にく] です。', ARISH)).toBe('Takeshi-san wa gakusei ja nai desu. Niku desu.');
    expect(sayRomaji('ううん、湖[みずうみ]。', ARISH)).toBe('Uun, mizuumi.');
  });

  it("keeps a verb's final う a sound of its own", () => {
    expect(sayRomaji('そう 思[おも]う。', ARISH)).toBe('Sō omou.');
  });
});

describe("a lesson's cards", () => {
  it('each have their own id, by point and place', () => {
    const lesson = {
      id: 'genki-1',
      lesson: 1,
      title: '',
      goal: '',
      points: [
        { title: 'a', text: '', examples: [], say: [{ en: 'x', ja: 'x' }, { en: 'y', ja: 'y' }] },
        { title: 'b', text: '', examples: [], say: [{ en: 'z', ja: 'z' }] },
      ],
    } satisfies GrammarLesson;
    expect(sayCardIds(lesson)).toEqual(['say:genki-1:0:0', 'say:genki-1:0:1', 'say:genki-1:1:0']);
  });
});
