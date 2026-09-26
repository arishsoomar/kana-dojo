import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import { EXAM_PASS, examId } from './exam';
import { badgeLevel, kanaLearned, lessonsSince, overallAccuracy, overallStrikeSpeed, rowBeltsEarned, trainingSince } from './profile';

const progress: Progress = {
  ...EMPTY_PROGRESS,
  kana: {
    あ: { box: 3, at: 0 },
    い: { box: 6, at: 0 },
    う: { box: 1, at: 0 },
    ア: { box: 9, at: 0 },
  },
  stats: {
    あ: { seen: 4, correct: 3, recentMs: [900, 1300] },
    い: { seen: 6, correct: 5, recentMs: [1100] },
  },
};

describe('profile stats', () => {
  it('counts kana learned: past white belt, in both scripts', () => {
    expect(kanaLearned(progress)).toBe(3);
  });

  it('works out accuracy across every answer, or null with none', () => {
    expect(overallAccuracy(progress)).toBeCloseTo(8 / 10);
    expect(overallAccuracy(EMPTY_PROGRESS)).toBeNull();
  });

  it('takes strike speed as the median of all recent correct times', () => {
    expect(overallStrikeSpeed(progress)).toBe(1100);
    expect(overallStrikeSpeed(EMPTY_PROGRESS)).toBeNull();
  });

  it('counts rows that have earned a belt by exam', () => {
    const aRow = Object.fromEntries([...'あいうえお'].map((c) => [c, { box: 3, at: 0 }]));
    const earned = completeLesson({ ...EMPTY_PROGRESS, kana: aRow }, examId('hiragana', 'a', 'green'), 1000, EXAM_PASS);
    expect(rowBeltsEarned(earned)).toBe(1);
    expect(rowBeltsEarned({ ...EMPTY_PROGRESS, kana: aRow })).toBe(0);
  });

  it('finds when training started: the first finished lesson', () => {
    let p = completeLesson(EMPTY_PROGRESS, 'practice:hiragana', 5000);
    p = completeLesson(p, 'practice:hiragana', 2000);
    expect(trainingSince(p)).toBe(2000);
    expect(trainingSince(EMPTY_PROGRESS)).toBeNull();
  });

  it('counts lessons finished since a time', () => {
    let p = completeLesson(EMPTY_PROGRESS, 'a', 1000);
    p = completeLesson(p, 'b', 5000);
    p = completeLesson(p, 'c', 9000);
    expect(lessonsSince(p, 5000)).toBe(2);
  });
});

describe('badgeLevel', () => {
  const levels = [7, 30, 100];

  it('starts at level 0, working toward the first goal', () => {
    expect(badgeLevel(3, levels)).toEqual({ level: 0, goal: 7, value: 3 });
  });

  it('reaches a level at its goal and moves on to the next', () => {
    expect(badgeLevel(7, levels)).toEqual({ level: 1, goal: 30, value: 7 });
    expect(badgeLevel(45, levels)).toEqual({ level: 2, goal: 100, value: 45 });
  });

  it('has no next goal once every level is reached', () => {
    expect(badgeLevel(120, levels)).toEqual({ level: 3, goal: null, value: 120 });
  });
});
