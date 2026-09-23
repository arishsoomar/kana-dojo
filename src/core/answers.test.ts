import { recordAnswer, type Progress } from './answers';
import { intervalFor } from './boxes';

const NOW = 1_000_000;

// Progress where シ is in `box` and due at `dueAt` (right now by default).
function progressWith(box: number, dueAt = NOW): Progress {
  return {
    kana: { シ: { box, dueAt } },
    confusions: [],
  };
}

describe('recordAnswer: correct, due, fast', () => {
  it('moves the kana up one box', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ'].box).toBe(3);
  });

  it('schedules it at the new box interval', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ'].dueAt).toBe(NOW + intervalFor(3));
  });

  it('never goes above box 7', () => {
    const next = recordAnswer(progressWith(7), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ'].box).toBe(7);
  });
});

describe('recordAnswer: correct but not due', () => {
  it('leaves the box and due time alone', () => {
    const dueLater = NOW + 60_000;
    const next = recordAnswer(progressWith(2, dueLater), { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 2, dueAt: dueLater });
  });
});

describe('recordAnswer: correct and due, but slow', () => {
  it('counts 4 seconds or more as slow: same box, rescheduled', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 4000, now: NOW });
    expect(next.kana['シ']).toEqual({ box: 2, dueAt: NOW + intervalFor(2) });
  });

  it('still promotes just under 4 seconds', () => {
    const next = recordAnswer(progressWith(2), { char: 'シ', guess: 'シ', ms: 3999, now: NOW });
    expect(next.kana['シ'].box).toBe(3);
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
    expect(next.kana['シ'].box).toBe(0);
  });

  it('drops even when the kana was not due yet', () => {
    const next = recordAnswer(progressWith(5, NOW + 60_000), wrong);
    expect(next.kana['シ'].box).toBe(3);
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
  const empty: Progress = { kana: {}, confusions: [] };

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
      kana: { シ: { box: 4, dueAt: NOW } },
      confusions: [{ shown: 'ぬ', guessed: 'め' }],
    };
    const snapshot = structuredClone(before);

    recordAnswer(before, { char: 'シ', guess: 'シ', ms: 1500, now: NOW });
    recordAnswer(before, { char: 'シ', guess: 'ツ', ms: 1500, now: NOW });

    expect(before).toEqual(snapshot);
  });
});
