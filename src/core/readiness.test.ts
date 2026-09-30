import { EMPTY_PROGRESS, type Progress } from './answers';
import { rateWord } from './deck';
import { KANA, rowKind } from './kana';
import { grammarReadiness, WORDS_BEFORE_GRAMMAR } from './readiness';

// Progress with these kana at this box.
function withKana(chars: readonly string[], box: number, from: Progress = EMPTY_PROGRESS): Progress {
  return { ...from, kana: { ...from.kana, ...Object.fromEntries(chars.map((c) => [c, { box, at: 1 }])) } };
}
const hiragana = (basic: boolean) =>
  KANA.filter((k) => k.script === 'hiragana' && (rowKind(k.row) === 'basic') === basic).map((k) => k.char);

describe('ready for grammar', () => {
  it('lists what helps, with nothing done at the start', () => {
    const { items, ready } = grammarReadiness(EMPTY_PROGRESS);
    expect(ready).toBe(false);
    expect(items.map((i) => [i.id, i.needed, i.done])).toEqual([
      ['hiragana', true, 0],
      ['hiraganaMore', true, 0],
      ['words', false, 0],
      ['katakana', false, 0],
    ]);
    expect(items.find((i) => i.id === 'hiragana')?.target).toBe(46);
    expect(items.find((i) => i.id === 'words')?.target).toBe(WORDS_BEFORE_GRAMMAR);
  });

  it('counts kana at green belt or better, not ones only seen', () => {
    const seen = withKana(hiragana(true), 2);
    expect(grammarReadiness(seen).items[0]?.done).toBe(0);
    const green = withKana(hiragana(true), 3);
    expect(grammarReadiness(green).items[0]?.done).toBe(46);
  });

  it('is ready once all hiragana are green, even before words and katakana', () => {
    const all = withKana([...hiragana(true), ...hiragana(false)], 4);
    expect(grammarReadiness(all).ready).toBe(true);
    expect(grammarReadiness(withKana(hiragana(true), 4)).ready).toBe(false);
  });

  it('counts words started in the deck, up to its target', () => {
    let progress = EMPTY_PROGRESS;
    for (let i = 0; i < 60; i++) progress = rateWord(progress, String(i), 3, 1);
    expect(grammarReadiness(progress).items.find((i) => i.id === 'words')?.done).toBe(WORDS_BEFORE_GRAMMAR);
  });
});
