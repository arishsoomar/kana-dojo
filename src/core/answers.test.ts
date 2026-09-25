import { bestScore, completeLesson, EMPTY_PROGRESS, finishOnboarding, isEmptyProgress, markDue, recordAnswer, type Progress } from './answers';
import { intervalFor } from './boxes';

const NOW = 1_000_000;

// Progress where シ is in `box` and due at `dueAt` (right now by default).
function progressWith(box: number, dueAt = NOW): Progress {
  return {
    ...EMPTY_PROGRESS,
    kana: { シ: { box, dueAt } },
  };
}

describe('recordAnswer: correct, due, fast', () => {
  it('moves the kana up one box', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']?.box).toBe(3);
  });

  it('schedules it at the new box interval', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']?.dueAt).toBe(NOW + intervalFor(3));
  });

  it('never goes above box 7', () => {
    const next = recordAnswer(progressWith(7), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']?.box).toBe(7);
  });
});

describe('recordAnswer: correct but not due', () => {
  it('leaves a green-or-better kana alone', () => {
    const dueLater = NOW + 60_000;
    const next = recordAnswer(progressWith(3, dueLater), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 3, dueAt: dueLater });
  });

  it('still promotes a white-belt kana: below green, right answers count, not time', () => {
    const dueLater = NOW + 60_000;
    const next = recordAnswer(progressWith(2, dueLater), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 3, dueAt: NOW + intervalFor(3) });
  });
});

describe('recordAnswer: correct and due, but slow', () => {
  it('counts 4 seconds or more as slow: same box, rescheduled', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 4000, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 2, dueAt: NOW + intervalFor(2) });
  });

  it('still promotes just under 4 seconds', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 3999, now: NOW });
    expect(next.kana['シ']?.box).toBe(3);
  });
});

describe('recordAnswer: wrong', () => {
  const wrong = { char: 'シ', guess: 'ツ', ms: 1500, now: NOW };

  it('drops two boxes and is due immediately', () => {
    const next = recordAnswer(progressWith(5), wrong);
    expect(next.kana['シ']).toEqual({ box: 3, dueAt: NOW });
  });

  it('never drops below box 0', () => {
    const next = recordAnswer(progressWith(1), wrong);
    expect(next.kana['シ']?.box).toBe(0);
  });

  it('drops even when the kana was not due yet', () => {
    const next = recordAnswer(progressWith(5, NOW + 60_000), wrong);
    expect(next.kana['シ']?.box).toBe(3);
  });

  it('logs what was shown and what was guessed', () => {
    const next = recordAnswer(progressWith(5), wrong);
    expect(next.confusions).toEqual([{ shown: 'シ', guessed: 'ツ' }]);
  });

  it('adds to earlier confusions instead of replacing them', () => {
    const before = { ...progressWith(5), confusions: [{ shown: 'ぬ', guessed: 'め' }] };
    const next = recordAnswer(before, wrong);
    expect(next.confusions).toEqual([
      { shown: 'ぬ', guessed: 'め' },
      { shown: 'シ', guessed: 'ツ' },
    ]);
  });
});

describe('recordAnswer: a kana with no progress yet', () => {
  const empty: Progress = { ...EMPTY_PROGRESS, kana: {} };

  it('treats it as box 0 and due, so a fast correct answer promotes it', () => {
    const next = recordAnswer(empty, { char: 'ア', guess: 'ア', ms: 1500, now: NOW });
    expect(next.kana['ア']).toEqual({ box: 1, dueAt: NOW + intervalFor(1) });
  });

  it('keeps it at box 0 on a wrong answer', () => {
    const next = recordAnswer(empty, { char: 'ア', guess: 'マ', ms: 1500, now: NOW });
    expect(next.kana['ア']).toEqual({ box: 0, dueAt: NOW });
  });
});

describe('recordAnswer: immutability', () => {
  it('never changes the progress it was given', () => {
    const before: Progress = {
      ...EMPTY_PROGRESS,
      kana: { シ: { box: 4, dueAt: NOW } },
      confusions: [{ shown: 'ぬ', guessed: 'め' }],
    };
    const snapshot = structuredClone(before);

    recordAnswer(before, { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    recordAnswer(before, { char: 'シ', guess: 'ツ', ms: 1500, now: NOW });

    expect(before).toEqual(snapshot);
  });
});

describe('recordAnswer: stats', () => {
  const empty: Progress = { ...EMPTY_PROGRESS, kana: {} };

  it('counts every answer and every correct one, due or not', () => {
    let progress = recordAnswer(empty, { char: 'シ', guess: 'シ', ms: 900, now: NOW });
    progress = recordAnswer(progress, { char: 'シ', guess: 'ツ', ms: 1200, now: NOW });
    progress = recordAnswer(progress, { char: 'シ', guess: 'シ', ms: 1100, now: NOW });
    expect(progress.stats['シ']).toEqual({ seen: 3, correct: 2, recentMs: [900, 1100] });
  });

  it('keeps only the last 10 correct answer times', () => {
    let progress = empty;
    for (let ms = 1; ms <= 12; ms++) {
      progress = recordAnswer(progress, { char: 'シ', guess: 'シ', ms, now: NOW });
    }
    expect(progress.stats['シ']?.recentMs).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe('completeLesson', () => {
  it('records which lesson was finished and when, keeping earlier records', () => {
    const once = completeLesson(EMPTY_PROGRESS, 'hiragana:a:0', 1000);
    const twice = completeLesson(once, 'review:hiragana', 2000);
    expect(twice.completed).toEqual([
      { lesson: 'hiragana:a:0', at: 1000 },
      { lesson: 'review:hiragana', at: 2000 },
    ]);
    expect(EMPTY_PROGRESS.completed).toEqual([]);
  });
});

describe('recordAnswer: no answer given', () => {
  it('counts as wrong but logs no mix-up, since nothing was confused', () => {
    const next = recordAnswer(progressWith(5), { char: 'シ', guess: null, ms: 9000, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 3, dueAt: NOW });
    expect(next.confusions).toEqual([]);
    expect(next.stats['シ']).toEqual({ seen: 1, correct: 0, recentMs: [] });
  });
});

describe('markDue', () => {
  it('makes a kana due now without changing its box, stats or mix-ups', () => {
    const before = { ...progressWith(5, NOW + 60_000), stats: { シ: { seen: 4, correct: 4, recentMs: [900] } } };
    const next = markDue(before, 'シ', NOW);
    expect(next.kana['シ']).toEqual({ box: 5, dueAt: NOW });
    expect(next.stats).toEqual(before.stats);
    expect(next.confusions).toEqual(before.confusions);
  });

  it('leaves a kana that is already due alone', () => {
    const before = progressWith(5, NOW - 1000);
    expect(markDue(before, 'シ', NOW).kana['シ']).toEqual({ box: 5, dueAt: NOW - 1000 });
  });

  it('never changes the progress it was given', () => {
    const before = progressWith(5, NOW + 60_000);
    const snapshot = structuredClone(before);
    markDue(before, 'シ', NOW);
    expect(before).toEqual(snapshot);
  });
});

describe('game scores', () => {
  it('can store a score with a finished game', () => {
    const next = completeLesson(EMPTY_PROGRESS, 'game:rain', 1000, 520);
    expect(next.completed).toEqual([{ lesson: 'game:rain', at: 1000, score: 520 }]);
  });

  it('finds the best score for a game, or null if it was never played', () => {
    expect(bestScore(EMPTY_PROGRESS, 'game:rain')).toBeNull();
    let progress = completeLesson(EMPTY_PROGRESS, 'game:rain', 1000, 520);
    progress = completeLesson(progress, 'game:rain', 2000, 1240);
    progress = completeLesson(progress, 'game:rain', 3000, 300);
    progress = completeLesson(progress, 'hiragana:a:0', 4000);
    expect(bestScore(progress, 'game:rain')).toBe(1240);
  });
});

describe('onboarding', () => {
  it('starts not onboarded, and finishOnboarding marks it done', () => {
    expect(EMPTY_PROGRESS.settings.onboarded).toBe(false);
    const done = finishOnboarding(EMPTY_PROGRESS);
    expect(done.settings.onboarded).toBe(true);
    expect(EMPTY_PROGRESS.settings.onboarded).toBe(false);
  });
});

describe('isEmptyProgress', () => {
  it('is true for a learner who has done nothing yet', () => {
    expect(isEmptyProgress(EMPTY_PROGRESS)).toBe(true);
    expect(isEmptyProgress(finishOnboarding(EMPTY_PROGRESS))).toBe(true);
  });

  it('is false once anything has been answered or finished', () => {
    expect(isEmptyProgress(progressWith(1))).toBe(false);
    expect(isEmptyProgress(completeLesson(EMPTY_PROGRESS, 'x', 1))).toBe(false);
  });
});
