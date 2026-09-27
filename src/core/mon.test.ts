import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import { EXAM_PASS, examId } from './exam';
import { REST_DAY_PRICE } from './gear';
import { MON, monBalance, monEarned, monSpent } from './mon';

// Progress with these finished records.
function withRecords(...records: [string, number?, number?][]): Progress {
  return {
    ...EMPTY_PROGRESS,
    completed: records.map(([lesson, score, opponent], at) => ({
      lesson,
      at,
      ...(score === undefined ? {} : { score }),
      ...(opponent === undefined ? {} : { opponent }),
    })),
  };
}

describe('monEarned', () => {
  it('is nothing for a new learner', () => {
    expect(monEarned(EMPTY_PROGRESS, [])).toBe(0);
  });

  it('pays for each lesson and each game', () => {
    const progress = withRecords(['hiragana:a:0'], ['practice:hiragana'], ['game:rain', 300], ['game:forge', 8]);
    expect(monEarned(progress, [])).toBe(2 * MON.lesson + 2 * MON.game);
  });

  it('pays for each belt exam passed, and nothing for one failed', () => {
    const progress = withRecords([examId('hiragana', 'a', 'green'), EXAM_PASS], [examId('hiragana', 'ka', 'green'), EXAM_PASS - 1]);
    expect(monEarned(progress, [])).toBe(MON.exam);
  });

  it('pays for each duel, and more for a win', () => {
    const progress = withRecords(['duel:シツ', 10, 3], ['duel:シツ', 4, 5]);
    expect(monEarned(progress, [])).toBe(2 * MON.duel + MON.duelWin);
  });

  it('pays for each day trained', () => {
    expect(monEarned(EMPTY_PROGRESS, ['2026-09-01', '2026-09-02'])).toBe(2 * MON.day);
  });
});

describe('monSpent and monBalance', () => {
  it('adds up what was bought, and the balance is what is left', () => {
    const progress: Progress = {
      ...completeLesson(EMPTY_PROGRESS, 'hiragana:a:0', 1),
      purchases: [
        { item: 'rest-day', at: 2 },
        { item: 'hachimaki', at: 3 },
      ],
    };
    expect(monSpent(progress)).toBe(REST_DAY_PRICE + 80);
    expect(monBalance(progress, ['2026-09-01'])).toBe(MON.lesson + MON.day - REST_DAY_PRICE - 80);
  });
});
