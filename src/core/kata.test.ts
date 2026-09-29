import { EMPTY_PROGRESS, FAST_MS, type Progress } from './answers';
import { KANA } from './kana';
import {
  completeKata,
  KATA_LENGTH,
  kataId,
  kataMark,
  kataNumber,
  kataOpen,
  kataQuestions,
  kataResult,
  kataShareText,
} from './kata';
import { monEarned } from './mon';
import { parseProgress, serializeProgress } from './saved';

// Met kana: box 3 (green), answered at time 1.
function knowing(chars: readonly string[], box = 3): Progress {
  return { ...EMPTY_PROGRESS, kana: Object.fromEntries(chars.map((c) => [c, { box, at: 1 }])) };
}

// The first five hiragana rows and the first katakana row: 30 kana, all met.
const HIRAGANA = [...'あいうえおかきくけこさしすせそたちつてとなにぬねの'];
const KATAKANA = [...'アイウエオ'];
const LEARNER = knowing([...HIRAGANA, ...KATAKANA]);
const DAY = '2026-09-28';

describe('kata numbers', () => {
  it('counts days from 1 January 2026', () => {
    expect(kataNumber('2026-01-01')).toBe(1);
    expect(kataNumber('2026-01-02')).toBe(2);
    expect(kataNumber('2026-09-28')).toBe(271);
    expect(kataNumber('2027-01-01')).toBe(366);
  });

  it('gives each day its own id', () => {
    expect(kataId(DAY)).not.toBe(kataId('2026-09-29'));
  });
});

describe('opening the kata', () => {
  it('opens once 20 kana are met, in either script', () => {
    expect(kataOpen(knowing(HIRAGANA.slice(0, 19)))).toBe(false);
    expect(kataOpen(knowing([...HIRAGANA.slice(0, 15), ...KATAKANA]))).toBe(true);
  });

  it('has no questions before it opens', () => {
    expect(kataQuestions(knowing(HIRAGANA.slice(0, 19)), DAY)).toEqual([]);
  });
});

describe("the day's kata", () => {
  it(`asks ${KATA_LENGTH} different kana, all of them met`, () => {
    const questions = kataQuestions(LEARNER, DAY);
    const chars = questions.map((q) => q.kana.char);
    expect(questions).toHaveLength(KATA_LENGTH);
    expect(new Set(chars).size).toBe(KATA_LENGTH);
    expect(chars.every((c) => LEARNER.kana[c] !== undefined)).toBe(true);
  });

  it('is the same all day, choices included', () => {
    expect(kataQuestions(LEARNER, DAY)).toEqual(kataQuestions(LEARNER, DAY));
  });

  it('is different the next day', () => {
    const today = kataQuestions(LEARNER, DAY).map((q) => q.kana.char);
    const tomorrow = kataQuestions(LEARNER, '2026-09-29').map((q) => q.kana.char);
    expect(tomorrow).not.toEqual(today);
  });

  it('is the same for learners who have met the same kana, whatever their belts', () => {
    const black = knowing([...HIRAGANA, ...KATAKANA], 9);
    expect(kataQuestions(black, DAY).map((q) => q.kana.char)).toEqual(kataQuestions(LEARNER, DAY).map((q) => q.kana.char));
  });

  it("gives each question four choices, the kana's own sound among them, from its own script", () => {
    for (const { kana, choices } of kataQuestions(LEARNER, DAY)) {
      expect(choices).toHaveLength(4);
      expect(choices).toContain(kana);
      expect(choices.every((c) => c.script === kana.script)).toBe(true);
    }
  });

  it('can mix scripts', () => {
    const all = knowing(KANA.filter((k) => k.row === 'a' || k.row === 'ka' || k.row === 'sa').map((k) => k.char));
    const scripts = new Set(kataQuestions(all, DAY).map((q) => q.kana.script));
    expect(scripts.size).toBe(2);
  });

  it('does not change the progress it was given', () => {
    const before = JSON.stringify(LEARNER);
    kataQuestions(LEARNER, DAY);
    expect(JSON.stringify(LEARNER)).toBe(before);
  });
});

describe('marks', () => {
  it(`is fast for a right answer under ${FAST_MS / 1000}s, slow for a slower one, and missed for a wrong one`, () => {
    expect(kataMark(true, FAST_MS - 1)).toBe('fast');
    expect(kataMark(true, FAST_MS)).toBe('slow');
    expect(kataMark(false, 500)).toBe('missed');
  });
});

describe('the result', () => {
  const marks = [...Array(17).fill('fast'), 'slow', 'missed', 'missed'] as const;
  const done = completeKata(LEARNER, DAY, 1_000, marks, 41_234);

  it("is kept for the day it was played, and only that day", () => {
    expect(kataResult(LEARNER, DAY)).toBeNull();
    expect(kataResult(done, DAY)).toEqual({ day: DAY, number: 271, marks, right: 18, ms: 41_234 });
    expect(kataResult(done, '2026-09-29')).toBeNull();
  });

  it('survives saving and loading', () => {
    expect(kataResult(parseProgress(serializeProgress(done)), DAY)).toEqual(kataResult(done, DAY));
  });

  it('counts as a game for mon', () => {
    expect(monEarned(done, []) - monEarned(LEARNER, [])).toBe(10);
  });

  it('does not change the progress it was given', () => {
    expect(LEARNER.completed).toEqual([]);
  });
});

describe('sharing', () => {
  const marks = [...Array(18).fill('fast'), 'slow', 'missed'] as const;
  const text = kataShareText({ day: DAY, number: 271, marks: [...marks], right: 19, ms: 41_234 });

  it('names the kata, the score and the time', () => {
    expect(text).toContain('Daily kata #271');
    expect(text).toContain('19/20');
    expect(text).toContain('41.2s');
  });

  it('shows the grid as coloured squares, five to a line', () => {
    const lines = text.split('\n').filter((line) => /[🟩🟨🟥]/u.test(line));
    expect(lines).toHaveLength(4);
    expect(lines[3]).toBe('🟩🟩🟩🟨🟥');
  });

  it('never gives the kana away', () => {
    expect(KANA.some((k) => text.includes(k.char))).toBe(false);
  });
});
