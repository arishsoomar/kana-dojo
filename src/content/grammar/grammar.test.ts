import { GENKI_DECKS, genkiCard } from '@/content/genki';
import { DEFAULT_NAME, parseRuby, sayJapanese, sayRomaji } from '@/core/grammar';

import { GRAMMAR_LESSONS } from './index';

const hasKanji = (text: string) => /[㐀-鿿々〆ヶ]/.test(text);

// Every kanji word and reading the GENKI decks have taught by a lesson, and any run of them in
// a word: 大学生 teaches 大学, 学生 and 大学生, each with its reading.
function taughtBy(lesson: number): Set<string> {
  const taught = new Set<string>();
  for (const deck of GENKI_DECKS.filter((d) => d.lesson <= lesson)) {
    for (const id of deck.ids) {
      const pieces = genkiCard(id)!.furigana;
      for (let from = 0; from < pieces.length; from++) {
        let base = '';
        let reading = '';
        for (let to = from; to < pieces.length && pieces[to]![1] !== undefined; to++) {
          base += pieces[to]![0];
          reading += pieces[to]![1];
          taught.add(`${base}|${reading}`);
        }
      }
    }
  }
  // 来る's other readings, in its conjugations: 来ます (き), 来ない (こ).
  for (const reading of ['き', 'こ']) taught.add(`来|${reading}`);
  return taught;
}

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
