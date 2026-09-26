import { EMPTY_PROGRESS, type Progress } from './answers';
import { combo, LESSON_LENGTH, median, summarizeLesson } from './lesson';

const NOW = 1_000_000;
const empty: Progress = { ...EMPTY_PROGRESS, kana: {} };

describe('LESSON_LENGTH', () => {
  it('is a fixed number of questions', () => {
    expect(LESSON_LENGTH).toBe(10);
  });
});

describe('median', () => {
  it('takes the middle value of an odd-length list', () => {
    expect(median([3000, 900, 1200])).toBe(1200);
  });

  it('averages the two middle values of an even-length list', () => {
    expect(median([900, 5000])).toBe(2950);
  });

  it('is null for an empty list', () => {
    expect(median([])).toBeNull();
  });
});

describe('summarizeLesson', () => {
  const answers = [
    { char: 'あ', correct: true, ms: 900 }, // fast: 15 XP
    { char: 'い', correct: true, ms: 5000 }, // slow: 10 XP
    { char: 'う', correct: false, ms: 1200 }, // wrong: 0 XP
  ];

  it('gives 10 XP per correct answer and 5 more for a fast one', () => {
    expect(summarizeLesson(empty, empty, answers).xp).toBe(25);
  });

  it('reports accuracy as the share of correct answers', () => {
    expect(summarizeLesson(empty, empty, answers).accuracy).toBeCloseTo(2 / 3);
  });

  it('measures strike speed as the median time of correct answers only', () => {
    expect(summarizeLesson(empty, empty, answers).strikeSpeedMs).toBe(2950);
  });

  it('lists kana that reached a higher belt, once each, and ignores drops', () => {
    const before: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 2, at: NOW }, い: { box: 3, at: NOW } },
    };
    const after: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 3, at: NOW }, い: { box: 1, at: NOW } },
    };
    const repeated = [...answers, { char: 'あ', correct: true, ms: 800 }];
    expect(summarizeLesson(before, after, repeated).promotions).toEqual([{ char: 'あ', belt: 'green' }]);
  });
});

describe('summarizeLesson: rows opened', () => {
  const green = { box: 3, at: 0 };
  const aRowAlmost: Progress = { ...EMPTY_PROGRESS, kana: { あ: green, い: green, う: green } };
  const aRowDone: Progress = { ...aRowAlmost, kana: { ...aRowAlmost.kana, え: green } };

  it('lists a row that opened during the lesson', () => {
    expect(summarizeLesson(aRowAlmost, aRowDone, []).rowsOpened).toEqual([{ script: 'hiragana', row: 'ka' }]);
  });

  it('lists nothing when no new row opened', () => {
    expect(summarizeLesson(aRowDone, aRowDone, []).rowsOpened).toEqual([]);
    expect(summarizeLesson(empty, aRowAlmost, []).rowsOpened).toEqual([]);
  });
});

describe('combo', () => {
  const right = { char: 'あ', correct: true, ms: 900 };
  const wrong = { char: 'あ', correct: false, ms: 900 };

  it('counts the right answers in a row at the end', () => {
    expect(combo([right, right, right])).toBe(3);
    expect(combo([right, wrong, right, right])).toBe(2);
  });

  it('is 0 after a miss, and before any answers', () => {
    expect(combo([right, right, wrong])).toBe(0);
    expect(combo([])).toBe(0);
  });
});
