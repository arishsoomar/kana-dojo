import type { Progress } from './answers';
import { parseProgress, serializeProgress } from './saved';

const EMPTY: Progress = { kana: {}, confusions: [], stats: {}, completed: [] };

const sample: Progress = {
  kana: { あ: { box: 3, dueAt: 1_000_000 }, シ: { box: 0, dueAt: 5 } },
  confusions: [{ shown: 'シ', guessed: 'ツ' }],
  stats: { あ: { seen: 4, correct: 3, recentMs: [900, 1200, 800] } },
  completed: [{ lesson: 'hiragana:a:0', at: 1_000_000 }],
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

  it('upgrades a version 1 save, which had no stats', () => {
    const v1 = JSON.stringify({
      version: 1,
      progress: { kana: { あ: { box: 3, dueAt: 1_000_000 } }, confusions: [{ shown: 'シ', guessed: 'ツ' }] },
    });
    expect(parseProgress(v1)).toEqual({
      kana: { あ: { box: 3, dueAt: 1_000_000 } },
      confusions: [{ shown: 'シ', guessed: 'ツ' }],
      stats: {},
      completed: [],
    });
  });

  it('upgrades a version 2 save, which had no finished lessons', () => {
    const v2 = JSON.stringify({
      version: 2,
      progress: { kana: {}, confusions: [], stats: { あ: { seen: 1, correct: 1, recentMs: [900] } } },
    });
    expect(parseProgress(v2)).toEqual({
      kana: {},
      confusions: [],
      stats: { あ: { seen: 1, correct: 1, recentMs: [900] } },
      completed: [],
    });
  });

  it('keeps valid entries and drops damaged ones', () => {
    const damaged = JSON.stringify({
      version: 3,
      progress: {
        kana: {
          あ: { box: 3, dueAt: 1_000_000 },
          い: { box: 'three', dueAt: 0 },
          う: { box: 12, dueAt: 0 },
          え: { box: 2 },
        },
        confusions: [{ shown: 'シ', guessed: 'ツ' }, { shown: 'シ' }, 'oops'],
        stats: {
          あ: { seen: 2, correct: 1, recentMs: [900] },
          い: { seen: 'two', correct: 1, recentMs: [] },
          う: { seen: 2, correct: 1, recentMs: ['fast'] },
        },
        completed: [{ lesson: 'hiragana:a:0', at: 5 }, { lesson: 'hiragana:a:1' }, 7],
      },
    });
    expect(parseProgress(damaged)).toEqual({
      kana: { あ: { box: 3, dueAt: 1_000_000 } },
      confusions: [{ shown: 'シ', guessed: 'ツ' }],
      stats: { あ: { seen: 2, correct: 1, recentMs: [900] } },
      completed: [{ lesson: 'hiragana:a:0', at: 5 }],
    });
  });
});
