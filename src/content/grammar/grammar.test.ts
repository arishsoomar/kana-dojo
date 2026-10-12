import { taughtBy } from '@/content/genki';
import { DEFAULT_NAME, parseRuby, sayJapanese, sayRomaji } from '@/core/grammar';

import { GRAMMAR_LESSONS } from './index';

const hasKanji = (text: string) => /[㐀-鿿々〆ヶ]/.test(text);

const sentencesOf = (l: (typeof GRAMMAR_LESSONS)[number]) => l.points.flatMap((p) => [...p.examples.map((e) => e.ja), ...p.say.map((s) => s.ja)]);

describe('the grammar lessons', () => {
  it('are GENKI I lessons 1 to 12, in order, each with its grammar points', () => {
    expect(GRAMMAR_LESSONS.map((l) => l.lesson)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(GRAMMAR_LESSONS.map((l) => l.id)).toEqual(GRAMMAR_LESSONS.map((l) => `genki-${l.lesson}`));
    for (const l of GRAMMAR_LESSONS) {
      expect(l.points.length).toBeGreaterThanOrEqual(3);
      for (const p of l.points) {
        expect(p.examples.length).toBeGreaterThanOrEqual(2);
        expect(p.say.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('give every kanji a reading, in kana', () => {
    const bare = GRAMMAR_LESSONS.flatMap(sentencesOf)
      .flatMap((t) => parseRuby(sayJapanese(t, DEFAULT_NAME)))
      .filter((p) => (p[1] === undefined ? hasKanji(p[0]) : hasKanji(p[1]) || !hasKanji(p[0])));
    expect(bare).toEqual([]);
  });

  it('only use kanji words taught by that lesson (or before), with their readings', () => {
    const untaught = GRAMMAR_LESSONS.flatMap((l) => {
      const taught = taughtBy(l.lesson);
      return sentencesOf(l)
        .flatMap((t) => parseRuby(t))
        .filter((p) => p[1] !== undefined && !taught.has(`${p[0]}|${p[1]}`))
        .map((p) => `L${l.lesson} ${p[0]}[${p[1]}]`);
    });
    expect([...new Set(untaught)]).toEqual([]);
  });

  it('read every sentence to say in romaji, with no kana left over', () => {
    const unread = GRAMMAR_LESSONS.flatMap((l) => l.points.flatMap((p) => p.say)).filter((s) => /[぀-ヿ㐀-鿿]/.test(sayRomaji(s.ja, DEFAULT_NAME)));
    expect(unread.map((s) => s.ja)).toEqual([]);
  });

  it('keep Japanese in titles and explanations to kana, so none is left without a reading', () => {
    expect(GRAMMAR_LESSONS.filter((l) => hasKanji(l.title) || hasKanji(l.goal)).map((l) => l.title)).toEqual([]);
    expect(GRAMMAR_LESSONS.flatMap((l) => l.points.filter((p) => hasKanji(p.text) || hasKanji(p.title)).map((p) => p.title))).toEqual([]);
  });

  it('have no sentence to say twice in a lesson', () => {
    for (const l of GRAMMAR_LESSONS) {
      const said = l.points.flatMap((p) => p.say.map((s) => s.ja));
      expect(said.length).toBe(new Set(said).size);
    }
  });
});
