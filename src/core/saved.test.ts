import type { Progress } from './answers';
import { parseProgress, serializeProgress } from './saved';

const EMPTY: Progress = { kana: {}, confusions: [], stats: {}, completed: [], settings: { onboarded: false, dailyGoal: 2, script: 'hiragana', sound: true, haptics: true } };

const sample: Progress = {
  kana: { あ: { box: 3, dueAt: 1_000_000 }, シ: { box: 0, dueAt: 5 } },
  confusions: [{ shown: 'シ', guessed: 'ツ' }],
  stats: { あ: { seen: 4, correct: 3, recentMs: [900, 1200, 800] } },
  completed: [
    { lesson: 'hiragana:a:0', at: 1_000_000 },
    { lesson: 'game:rain', at: 2_000_000, score: 640 },
    { lesson: 'duel:シツ', at: 3_000_000, score: 10, opponent: 3 },
  ],
  settings: { onboarded: true, dailyGoal: 3, script: 'katakana', sound: false, haptics: false },
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
      settings: { onboarded: true, dailyGoal: 2, script: 'hiragana', sound: true, haptics: true },
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
      settings: { onboarded: true, dailyGoal: 2, script: 'hiragana', sound: true, haptics: true },
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
        completed: [
          { lesson: 'hiragana:a:0', at: 5 },
          { lesson: 'hiragana:a:1' },
          7,
          { lesson: 'game:rain', at: 6, score: 'lots' },
          { lesson: 'duel:シツ', at: 8, score: 10, opponent: 'three' },
        ],
      },
    });
    expect(parseProgress(damaged)).toEqual({
      kana: { あ: { box: 3, dueAt: 1_000_000 } },
      confusions: [{ shown: 'シ', guessed: 'ツ' }],
      stats: { あ: { seen: 2, correct: 1, recentMs: [900] } },
      completed: [{ lesson: 'hiragana:a:0', at: 5 }],
      settings: { onboarded: true, dailyGoal: 2, script: 'hiragana', sound: true, haptics: true },
    });
  });

  it('counts a save from before onboarding existed as onboarded only if it has progress', () => {
    const used = JSON.stringify({ version: 3, progress: { kana: { あ: { box: 1, dueAt: 0 } }, confusions: [], stats: {}, completed: [] } });
    const blank = JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [] } });
    expect(parseProgress(used).settings.onboarded).toBe(true);
    expect(parseProgress(blank).settings.onboarded).toBe(false);
  });

  it('keeps the saved onboarding setting', () => {
    const saved = JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [], settings: { onboarded: true } } });
    expect(parseProgress(saved).settings.onboarded).toBe(true);
  });
});

describe('saving the daily goal', () => {
  it('keeps a valid goal and replaces a missing or broken one with the default', () => {
    const save = (settings: unknown) =>
      JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [], settings } });
    expect(parseProgress(save({ onboarded: true, dailyGoal: 4 })).settings.dailyGoal).toBe(4);
    expect(parseProgress(save({ onboarded: true })).settings.dailyGoal).toBe(2);
    expect(parseProgress(save({ onboarded: true, dailyGoal: 9 })).settings.dailyGoal).toBe(2);
    expect(parseProgress(save({ onboarded: true, dailyGoal: 'lots' })).settings.dailyGoal).toBe(2);
  });
});

describe('saving the chosen script', () => {
  it('keeps a valid script and otherwise starts on hiragana', () => {
    const save = (settings: unknown) =>
      JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [], settings } });
    expect(parseProgress(save({ onboarded: true, script: 'katakana' })).settings.script).toBe('katakana');
    expect(parseProgress(save({ onboarded: true })).settings.script).toBe('hiragana');
    expect(parseProgress(save({ onboarded: true, script: 'klingon' })).settings.script).toBe('hiragana');
  });
});

describe('saving the sound setting', () => {
  it('keeps sound off if it was turned off, and otherwise has it on', () => {
    const save = (settings: unknown) =>
      JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [], settings } });
    expect(parseProgress(save({ onboarded: true, sound: false })).settings.sound).toBe(false);
    expect(parseProgress(save({ onboarded: true })).settings.sound).toBe(true);
    expect(parseProgress(save({ onboarded: true, sound: 'loud' })).settings.sound).toBe(true);
  });
});

describe('saving the haptics setting', () => {
  it('keeps haptics off if they were turned off, and otherwise has them on', () => {
    const save = (settings: unknown) =>
      JSON.stringify({ version: 3, progress: { kana: {}, confusions: [], stats: {}, completed: [], settings } });
    expect(parseProgress(save({ onboarded: true, haptics: false })).settings.haptics).toBe(false);
    expect(parseProgress(save({ onboarded: true })).settings.haptics).toBe(true);
    expect(parseProgress(save({ onboarded: true, haptics: 'buzzy' })).settings.haptics).toBe(true);
  });
});
