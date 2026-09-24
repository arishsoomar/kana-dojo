import { EMPTY_PROGRESS, type Progress } from './answers';
import { LESSON_LENGTH, median, summarizeLesson } from './lesson';

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
      kana: { あ: { box: 2, dueAt: NOW }, い: { box: 3, dueAt: NOW } },
    };
    const after: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 3, dueAt: NOW }, い: { box: 1, dueAt: NOW } },
    };
    const repeated = [...answers, { char: 'あ', correct: true, ms: 800 }];
    expect(summarizeLesson(before, after, repeated).promotions).toEqual([{ char: 'あ', belt: 'green' }]);
  });
});
