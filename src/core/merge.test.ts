import { EMPTY_PROGRESS, type Progress } from './answers';
import { mergeProgress } from './merge';

// Two copies of one learner's progress, each with changes the other hasn't seen.
const phone: Progress = {
  kana: { あ: { box: 3, at: 500 }, い: { box: 1, at: 100 } },
  confusions: [
    { shown: 'あ', guessed: 'お' },
    { shown: 'あ', guessed: 'お' },
    { shown: 'ね', guessed: 'れ' },
  ],
  stats: { あ: { seen: 6, correct: 5, recentMs: [900, 800] } },
  completed: [
    { lesson: 'hiragana:a:0', at: 10 },
    { lesson: 'drill:あ', at: 20 },
  ],
  settings: { onboarded: true, dailyGoal: 3, script: 'hiragana', sound: true, haptics: true, typing: false },
};

const web: Progress = {
  kana: { あ: { box: 2, at: 300 }, い: { box: 2, at: 400 }, う: { box: 1, at: 50 } },
  confusions: [
    { shown: 'あ', guessed: 'お' },
    { shown: 'い', guessed: 'り' },
  ],
  stats: { あ: { seen: 4, correct: 3, recentMs: [700] }, う: { seen: 1, correct: 1, recentMs: [1200] } },
  completed: [
    { lesson: 'hiragana:a:0', at: 10 },
    { lesson: 'rain', at: 30, score: 480 },
  ],
  settings: { onboarded: false, dailyGoal: 1, script: 'katakana', sound: false, haptics: false, typing: false },
};

describe('mergeProgress', () => {
  it('keeps, per kana, the copy with the later due time', () => {
    const merged = mergeProgress(phone, web);
    expect(merged.kana).toEqual({
      あ: { box: 3, at: 500 },
      い: { box: 2, at: 400 },
      う: { box: 1, at: 50 },
    });
  });

  it('breaks a due-time tie with the higher box', () => {
    const a = { ...EMPTY_PROGRESS, kana: { あ: { box: 1, at: 100 } } };
    const b = { ...EMPTY_PROGRESS, kana: { あ: { box: 2, at: 100 } } };
    expect(mergeProgress(a, b).kana['あ']).toEqual({ box: 2, at: 100 });
  });

  it('combines mix-ups without counting shared ones twice: each pair keeps its larger count', () => {
    const count = (p: Progress, shown: string, guessed: string) =>
      p.confusions.filter((c) => c.shown === shown && c.guessed === guessed).length;
    const merged = mergeProgress(phone, web);
    expect(merged.confusions).toHaveLength(4);
    expect(count(merged, 'あ', 'お')).toBe(2);
    expect(count(merged, 'ね', 'れ')).toBe(1);
    expect(count(merged, 'い', 'り')).toBe(1);
  });

  it('keeps, per kana, the stats that have seen more answers', () => {
    expect(mergeProgress(phone, web).stats).toEqual({
      あ: { seen: 6, correct: 5, recentMs: [900, 800] },
      う: { seen: 1, correct: 1, recentMs: [1200] },
    });
  });

  it('combines finished lessons, once each, oldest first', () => {
    expect(mergeProgress(phone, web).completed).toEqual([
      { lesson: 'hiragana:a:0', at: 10 },
      { lesson: 'drill:あ', at: 20 },
      { lesson: 'rain', at: 30, score: 480 },
    ]);
  });

  it('keeps the settings of the first copy (the device in hand), onboarded if either is', () => {
    expect(mergeProgress(web, phone).settings).toEqual({ onboarded: true, dailyGoal: 1, script: 'katakana', sound: false, haptics: false, typing: false });
  });

  it('gives the same training record whichever order the copies come in', () => {
    const { settings: _a, ...one } = mergeProgress(phone, web);
    const { settings: _b, ...other } = mergeProgress(web, phone);
    expect(JSON.stringify(one)).toBe(JSON.stringify(other));
  });

  it('changes nothing when merged with itself or with empty progress', () => {
    expect(mergeProgress(phone, phone)).toEqual(mergeProgress(phone, EMPTY_PROGRESS));
    expect(mergeProgress(phone, EMPTY_PROGRESS).kana).toEqual(phone.kana);
    expect(mergeProgress(phone, EMPTY_PROGRESS).completed).toEqual(phone.completed);
  });

  it('does not change either copy', () => {
    const before = JSON.stringify(phone);
    mergeProgress(phone, web);
    expect(JSON.stringify(phone)).toBe(before);
  });
});
