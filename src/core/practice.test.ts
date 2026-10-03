import { EMPTY_PROGRESS, type Progress } from './answers';
import { KANA } from './kana';
import { makePracticeQuestion, practicePool, practiceRows } from './practice';
import { seededRng } from './random';

const green = { box: 3, at: 0 };
// All basic hiragana at green, so every hiragana row is open; katakana untouched.
const hiraganaDone: Progress = {
  ...EMPTY_PROGRESS,
  kana: Object.fromEntries(KANA.filter((k) => k.script === 'hiragana').map((k) => [k.char, green])),
};

describe('rows open for practice', () => {
  it('are the unlocked rows of each script, in order', () => {
    expect(practiceRows(EMPTY_PROGRESS, 'hiragana')).toEqual(['a']);
    expect(practiceRows(hiraganaDone, 'hiragana').slice(0, 3)).toEqual(['a', 'ka', 'sa']);
    expect(practiceRows(hiraganaDone, 'katakana')).toEqual(['a']);
  });
});

describe('the kana to practise', () => {
  it('are the kana of the rows chosen, only if they are open', () => {
    const pool = practicePool(hiraganaDone, [
      { script: 'hiragana', row: 'ka' },
      { script: 'katakana', row: 'a' },
      { script: 'katakana', row: 'ka' }, // not open yet
    ]);
    expect(pool.map((k) => k.char)).toEqual(['か', 'き', 'く', 'け', 'こ', 'ア', 'イ', 'ウ', 'エ', 'オ']);
  });
});

describe('a practice question', () => {
  const pool = practicePool(hiraganaDone, [
    { script: 'hiragana', row: 'ka' },
    { script: 'katakana', row: 'a' },
  ]);

  it('asks a kana from the chosen ones, with four choices from its own script', () => {
    for (let i = 0; i < 30; i++) {
      const { kana, choices } = makePracticeQuestion(hiraganaDone, pool, seededRng(`q${i}`));
      expect(pool).toContain(kana);
      expect(choices).toHaveLength(4);
      expect(choices).toContain(kana);
      expect(choices.every((c) => c.script === kana.script)).toBe(true);
    }
  });

  it('mixes the scripts when both are chosen', () => {
    const scripts = new Set(Array.from({ length: 40 }, (_, i) => makePracticeQuestion(hiraganaDone, pool, seededRng(`m${i}`)).kana.script));
    expect([...scripts].sort()).toEqual(['hiragana', 'katakana']);
  });

  it('never asks the same kana twice in a row', () => {
    for (let i = 0; i < 20; i++) {
      expect(makePracticeQuestion(hiraganaDone, pool, seededRng(`a${i}`), 'か').kana.char).not.toBe('か');
    }
  });
});
