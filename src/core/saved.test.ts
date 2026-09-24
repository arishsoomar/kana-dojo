import type { Progress } from './answers';
import { parseProgress, serializeProgress } from './saved';

const EMPTY: Progress = { kana: {}, confusions: [] };

const sample: Progress = {
  kana: { あ: { box: 3, dueAt: 1_000_000 }, シ: { box: 0, dueAt: 5 } },
  confusions: [{ shown: 'シ', guessed: 'ツ' }],
};

describe('saving progress', () => {
  it('reads back exactly what was saved', () => {
    expect(parseProgress(serializeProgress(sample))).toEqual(sample);
  });

  it('starts fresh when nothing has been saved yet (first launch)', () => {
    expect(parseProgress(null)).toEqual(EMPTY);
  });

  it('starts fresh when the saved text is not valid JSON', () => {
    expect(parseProgress('{not json')).toEqual(EMPTY);
  });

  it('starts fresh when the save is from an unknown format version', () => {
    const future = JSON.stringify({ version: 99, progress: sample });
    expect(parseProgress(future)).toEqual(EMPTY);
  });

  it('keeps valid entries and drops damaged ones', () => {
    const damaged = JSON.stringify({
      version: 1,
      progress: {
        kana: {
          あ: { box: 3, dueAt: 1_000_000 },
          い: { box: 'three', dueAt: 0 },
          う: { box: 12, dueAt: 0 },
          え: { box: 2 },
        },
        confusions: [{ shown: 'シ', guessed: 'ツ' }, { shown: 'シ' }, 'oops'],
      },
    });
    expect(parseProgress(damaged)).toEqual({
      kana: { あ: { box: 3, dueAt: 1_000_000 } },
      confusions: [{ shown: 'シ', guessed: 'ツ' }],
    });
  });
});
