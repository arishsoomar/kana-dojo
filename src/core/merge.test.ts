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
  purchases: [
    { item: 'kasa', at: 40 },
    { item: 'rest-day', at: 50 },
  ],
  partners: [
    { day: '2026-10-01', friend: 'kenji', at: 60, done: false },
    { day: '2026-09-30', friend: 'yuki', at: 55, done: true },
  ],
  words: {
    '1': { stability: 10, difficulty: 5, due: 900, last: 500, added: 100, reps: 3, lapses: 0 },
    '2': { stability: 3, difficulty: 5, due: 400, last: 300, added: 300, reps: 1, lapses: 0 },
  },
  grammar: { desu: { stability: 3, difficulty: 5, due: 400, last: 300, added: 300, reps: 1, lapses: 0 } },
  flashcards: { '1': { known: true, at: 500 }, '2': { known: false, at: 100 } },
  settings: { onboarded: true, dailyGoal: 3, script: 'hiragana', sound: true, haptics: true, typing: false, gear: ['kasa'], voice: null, wordFront: 'japanese', speaker: 'female', myName: null },
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
  purchases: [
    { item: 'kasa', at: 40 },
    { item: 'fan', at: 45 },
  ],
  partners: [
    { day: '2026-10-01', friend: 'kenji', at: 70, done: true },
    { day: '2026-10-01', friend: 'mei', at: 80, done: false },
  ],
  words: {
    '1': { stability: 30, difficulty: 4, due: 3000, last: 700, added: 100, reps: 4, lapses: 0 },
    '3': { stability: 1, difficulty: 6, due: 800, last: 600, added: 600, reps: 1, lapses: 0 },
  },
  grammar: { desu: { stability: 9, difficulty: 4, due: 2000, last: 900, added: 300, reps: 2, lapses: 0 } },
  flashcards: { '1': { known: false, at: 700 }, '3': { known: true, at: 50 } },
  settings: { onboarded: false, dailyGoal: 1, script: 'katakana', sound: false, haptics: false, typing: false, gear: [], voice: null, wordFront: 'english', speaker: 'male', myName: { ja: 'アリシュ', en: 'Arish' } },
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

  it('combines purchases, once each, oldest first', () => {
    expect(mergeProgress(phone, web).purchases).toEqual([
      { item: 'kasa', at: 40 },
      { item: 'fan', at: 45 },
      { item: 'rest-day', at: 50 },
    ]);
  });

  it('combines partner assignments, once per day and friend: done if either copy finished it, chosen at the earliest', () => {
    expect(mergeProgress(phone, web).partners).toEqual([
      { day: '2026-09-30', friend: 'yuki', at: 55, done: true },
      { day: '2026-10-01', friend: 'kenji', at: 60, done: true },
      { day: '2026-10-01', friend: 'mei', at: 80, done: false },
    ]);
  });

  it('keeps, per grammar point, the card reviewed most recently', () => {
    expect(mergeProgress(phone, web).grammar).toEqual(web.grammar);
  });

  it('keeps, per word, the card reviewed most recently', () => {
    expect(mergeProgress(phone, web).words).toEqual({ '1': web.words['1'], '2': phone.words['2'], '3': web.words['3'] });
    expect(mergeProgress(web, phone).words).toEqual(mergeProgress(phone, web).words);
  });

  it('keeps, per flashcard, the one marked most recently', () => {
    expect(mergeProgress(phone, web).flashcards).toEqual({ '1': web.flashcards['1'], '2': phone.flashcards['2'], '3': web.flashcards['3'] });
    expect(mergeProgress(web, phone).flashcards).toEqual(mergeProgress(phone, web).flashcards);
  });

  it('keeps the settings of the first copy (the device in hand), onboarded if either is', () => {
    expect(mergeProgress(web, phone).settings).toEqual({ onboarded: true, dailyGoal: 1, script: 'katakana', sound: false, haptics: false, typing: false, gear: [], voice: null, wordFront: 'english', speaker: 'male', myName: { ja: 'アリシュ', en: 'Arish' } });
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
