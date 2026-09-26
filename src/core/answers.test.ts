import {
  bestScore,
  climbLimit,
  completeLesson,
  EMPTY_PROGRESS,
  finishOnboarding,
  isEmptyProgress,
  recordAnswer,
  setHaptics,
  setSound,
  setTyping,
  type Progress,
} from './answers';

const NOW = 1_000_000;

// Progress where シ is in `box`, last answered a while ago.
function progressWith(box: number): Progress {
  return {
    ...EMPTY_PROGRESS,
    kana: { シ: { box, at: 1 } },
  };
}

const tap = (ms: number) => ({ char: 'シ', guess: 'シ', ms, now: NOW });
const typed = (ms: number) => ({ char: 'シ', guess: 'シ', ms, now: NOW, typed: true });

describe('climbLimit: how fast a right answer must be to move a kana up', () => {
  it('gets faster at each belt: 4s at white, 2.5s at green, 1.5s at brown', () => {
    expect([0, 2, 3, 5, 6, 8].map((box) => climbLimit(box, false))).toEqual([4000, 4000, 2500, 2500, 1500, 1500]);
  });

  it('gives typed answers more time: 6s, 4s and 3s', () => {
    expect([0, 3, 6].map((box) => climbLimit(box, true))).toEqual([6000, 4000, 3000]);
  });
});

describe('recordAnswer: a right tapped answer', () => {
  it('moves the kana up one step when it beats the limit', () => {
    expect(recordAnswer(progressWith(2), tap(3999)).kana['シ']).toEqual({ box: 3, at: NOW });
  });

  it('keeps it where it is at or over the limit', () => {
    expect(recordAnswer(progressWith(2), tap(4000)).kana['シ']).toEqual({ box: 2, at: NOW });
  });

  it('needs under 2.5 seconds to climb from green', () => {
    expect(recordAnswer(progressWith(3), tap(2600)).kana['シ']?.box).toBe(3);
    expect(recordAnswer(progressWith(3), tap(2400)).kana['シ']?.box).toBe(4);
  });

  it('needs under 1.5 seconds to climb from brown', () => {
    expect(recordAnswer(progressWith(8), tap(1600)).kana['シ']?.box).toBe(8);
    expect(recordAnswer(progressWith(8), tap(1400)).kana['シ']?.box).toBe(9);
  });

  it('never goes above black', () => {
    expect(recordAnswer(progressWith(9), tap(500)).kana['シ']?.box).toBe(9);
  });

  it('has no waiting: answering again straight away still counts', () => {
    let progress = progressWith(3);
    progress = recordAnswer(progress, tap(1000));
    progress = recordAnswer(progress, tap(1000));
    expect(progress.kana['シ']?.box).toBe(5);
  });
});

describe('recordAnswer: a right typed answer', () => {
  it('moves the kana up two steps', () => {
    expect(recordAnswer(progressWith(0), typed(5000)).kana['シ']).toEqual({ box: 2, at: NOW });
  });

  it('keeps it where it is when slower than the typing limit', () => {
    expect(recordAnswer(progressWith(3), typed(4000)).kana['シ']?.box).toBe(3);
  });

  it('can cross into the next belt, and never goes above black', () => {
    expect(recordAnswer(progressWith(2), typed(3000)).kana['シ']?.box).toBe(4);
    expect(recordAnswer(progressWith(8), typed(1000)).kana['シ']?.box).toBe(9);
  });
});

describe('recordAnswer: wrong', () => {
  const wrong = { char: 'シ', guess: 'ツ', ms: 1500, now: NOW };

  it('drops two steps', () => {
    expect(recordAnswer(progressWith(6), wrong).kana['シ']).toEqual({ box: 4, at: NOW });
  });

  it('never drops below box 0', () => {
    expect(recordAnswer(progressWith(1), wrong).kana['シ']?.box).toBe(0);
  });

  it('logs what was shown and what was guessed', () => {
    const next = recordAnswer(progressWith(5), wrong);
    expect(next.confusions).toEqual([{ shown: 'シ', guessed: 'ツ' }]);
  });

  it('logs no mix-up when nothing was guessed (typed nonsense, or a Kana Rain kana that landed)', () => {
    const next = recordAnswer(progressWith(5), { ...wrong, guess: null });
    expect(next.confusions).toEqual([]);
    expect(next.kana['シ']?.box).toBe(3);
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

  it('treats it as box 0, so a quick right answer moves it up', () => {
    const next = recordAnswer(empty, { char: 'ア', guess: 'ア', ms: 1500, now: NOW });
    expect(next.kana['ア']).toEqual({ box: 1, at: NOW });
  });

  it('keeps it at box 0 on a wrong answer', () => {
    const next = recordAnswer(empty, { char: 'ア', guess: 'マ', ms: 1500, now: NOW });
    expect(next.kana['ア']).toEqual({ box: 0, at: NOW });
  });
});

describe('recordAnswer: immutability', () => {
  it('never changes the progress it was given', () => {
    const before: Progress = {
      ...EMPTY_PROGRESS,
      kana: { シ: { box: 4, at: NOW } },
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

  it('counts every answer and every correct one', () => {
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

describe('sound', () => {
  it('starts on, and setSound turns it off and on without changing the input', () => {
    expect(EMPTY_PROGRESS.settings.sound).toBe(true);
    const muted = setSound(EMPTY_PROGRESS, false);
    expect(muted.settings.sound).toBe(false);
    expect(setSound(muted, true).settings.sound).toBe(true);
    expect(EMPTY_PROGRESS.settings.sound).toBe(true);
  });
});

describe('haptics', () => {
  it('start on, and setHaptics turns them off and on without changing the input', () => {
    expect(EMPTY_PROGRESS.settings.haptics).toBe(true);
    const off = setHaptics(EMPTY_PROGRESS, false);
    expect(off.settings.haptics).toBe(false);
    expect(setHaptics(off, true).settings.haptics).toBe(true);
    expect(EMPTY_PROGRESS.settings.haptics).toBe(true);
  });
});

describe('typing', () => {
  it('starts off (answers are tapped), and setTyping turns it on and off without changing the input', () => {
    expect(EMPTY_PROGRESS.settings.typing).toBe(false);
    const on = setTyping(EMPTY_PROGRESS, true);
    expect(on.settings.typing).toBe(true);
    expect(setTyping(on, false).settings.typing).toBe(false);
    expect(EMPTY_PROGRESS.settings.typing).toBe(false);
  });
});
