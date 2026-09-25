import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import { awardedBelt, EXAM_LENGTH, EXAM_PASS, examDue, examId, examQuestions, examStatus } from './exam';

// Progress where every kana in the hiragana a row is in `box`.
function aRowAt(box: number): Progress {
  return { ...EMPTY_PROGRESS, kana: Object.fromEntries([...'あいうえお'].map((c) => [c, { box, dueAt: 0 }])) };
}

function passed(progress: Progress, belt: 'green' | 'brown' | 'black', score = EXAM_PASS): Progress {
  return completeLesson(progress, examId('hiragana', 'a', belt), 1000, score);
}

describe('examDue', () => {
  it('offers nothing while a row is still white', () => {
    expect(examDue(aRowAt(2), 'hiragana', 'a')).toBeNull();
  });

  it('offers the exam for the belt a row qualifies for', () => {
    expect(examDue(aRowAt(3), 'hiragana', 'a')).toBe('green');
    expect(examDue(aRowAt(5), 'hiragana', 'a')).toBe('brown');
  });

  it('offers nothing once that belt has been passed', () => {
    expect(examDue(passed(aRowAt(3), 'green'), 'hiragana', 'a')).toBeNull();
  });

  it('offers the next exam when the row qualifies for a higher belt', () => {
    expect(examDue(passed(aRowAt(5), 'green'), 'hiragana', 'a')).toBe('brown');
  });

  it("doesn't count a failed attempt as passed", () => {
    expect(examDue(passed(aRowAt(3), 'green', EXAM_PASS - 1), 'hiragana', 'a')).toBe('green');
  });
});

describe('awardedBelt', () => {
  it('is white until an exam is passed, even if the row qualifies', () => {
    expect(awardedBelt(aRowAt(5), 'hiragana', 'a')).toBe('white');
  });

  it('is the highest belt passed', () => {
    expect(awardedBelt(passed(passed(aRowAt(5), 'green'), 'brown'), 'hiragana', 'a')).toBe('brown');
  });

  it("never shows higher than the row's kana currently are", () => {
    // Passed brown, but the kana have slipped back to green.
    expect(awardedBelt(passed(aRowAt(3), 'brown'), 'hiragana', 'a')).toBe('green');
  });
});

describe('examQuestions', () => {
  it("is EXAM_LENGTH questions, all from the row, each kana about equally often", () => {
    const questions = examQuestions('hiragana', 'a', () => 0.5);
    expect(questions).toHaveLength(EXAM_LENGTH);
    expect(questions.every((q) => 'あいうえお'.includes(q.char))).toBe(true);
    const counts = [...'あいうえお'].map((c) => questions.filter((q) => q.char === c).length);
    expect(counts).toEqual([4, 4, 4, 4, 4]);
  });
});

describe('examStatus', () => {
  it('is going while it can still be passed', () => {
    expect(examStatus({ correct: 5, misses: 2, timeUp: false })).toBe('going');
  });

  it('fails at the third miss, when 18 is out of reach', () => {
    expect(examStatus({ correct: 5, misses: 3, timeUp: false })).toBe('failed');
  });

  it('passes with 18 or more once all 20 are answered', () => {
    expect(examStatus({ correct: 18, misses: 2, timeUp: false })).toBe('passed');
    expect(examStatus({ correct: 20, misses: 0, timeUp: false })).toBe('passed');
  });

  it('fails when time runs out before the pass mark', () => {
    expect(examStatus({ correct: 12, misses: 0, timeUp: true })).toBe('failed');
  });
});

describe('examQuestions: no repeats', () => {
  it('never puts the same kana twice in a row, in any row', () => {
    for (const row of ['a', 'ka', 'ya', 'wa'] as const) {
      for (const rng of [() => 0, () => 0.5, () => 0.99]) {
        const chars = examQuestions('hiragana', row, rng).map((k) => k.char);
        const repeats = chars.filter((c, i) => i > 0 && c === chars[i - 1]);
        expect(repeats).toEqual([]);
      }
    }
  });
});
