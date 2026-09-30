import { canConjugate, exerciseAnswer, parseRuby, rubyText, type Exercise } from '@/core/grammar';
import { VOCAB } from '@/content/vocab';

import { GRAMMAR_LESSONS, UNIT_NAMES } from './index';

const hasKanji = (text: string) => /[㐀-鿿々〆ヶ]/.test(text);
// Every piece of Japanese in an exercise.
const japaneseOf = (e: Exercise): string[] =>
  e.kind === 'choose' ? [e.prompt, ...e.options] : e.kind === 'order' ? [...e.pieces] : e.kind === 'meaning' ? [e.ja] : [];

describe('the grammar lessons', () => {
  const texts = GRAMMAR_LESSONS.flatMap((l) => [...l.sections.flatMap((s) => s.examples.map((x) => x.ja)), ...l.exercises.flatMap(japaneseOf)]);

  it('each have their own id, a unit with a name, sections and exercises', () => {
    expect(new Set(GRAMMAR_LESSONS.map((l) => l.id)).size).toBe(GRAMMAR_LESSONS.length);
    for (const l of GRAMMAR_LESSONS) {
      expect(UNIT_NAMES[l.unit]).toBeDefined();
      expect(l.sections.length).toBeGreaterThan(0);
      expect(l.exercises.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('give every kanji a reading, in kana', () => {
    const bare = texts.flatMap((t) => parseRuby(t)).filter((p) => (p[1] === undefined ? hasKanji(p[0]) : hasKanji(p[1]) || !hasKanji(p[0])));
    expect(bare).toEqual([]);
  });

  it('keep Japanese in titles and explanations to kana, so none is left without a reading', () => {
    expect(GRAMMAR_LESSONS.filter((l) => hasKanji(l.title) || hasKanji(l.goal)).map((l) => l.title)).toEqual([]);
    expect(GRAMMAR_LESSONS.flatMap((l) => l.sections.filter((s) => hasKanji(s.text) || hasKanji(s.title)).map((s) => s.title))).toEqual([]);
  });

  it('only list words that are in the deck', () => {
    const deck = new Set(VOCAB.map((w) => w.word));
    expect(GRAMMAR_LESSONS.flatMap((l) => l.words.filter((w) => !deck.has(w)))).toEqual([]);
  });

  it('have one right answer among the options, and no option twice', () => {
    for (const l of GRAMMAR_LESSONS) {
      for (const e of l.exercises) {
        if (e.kind === 'choose' || e.kind === 'meaning') {
          expect(e.options).toContain(e.answer);
          expect(new Set(e.options).size).toBe(e.options.length);
        }
        if (e.kind === 'choose') expect(e.prompt).toContain('＿');
        if (e.kind === 'order') expect(new Set(e.pieces.map(rubyText)).size).toBe(e.pieces.length);
        if (e.kind === 'form') {
          expect(canConjugate(e.pos)).toBe(true);
          expect(exerciseAnswer(e)).not.toBe('');
        }
      }
    }
  });
});
