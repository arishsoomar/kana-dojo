import { EMPTY_PROGRESS, type Progress } from './answers';
import { makeDrillQuestion, makeQuestion } from './question';
import { unlockedKana } from './unlock';

const NEW_LEARNER: Progress = { ...EMPTY_PROGRESS, kana: {} };
const NOW = 1_000_000;

const rngs = [() => 0, () => 0.5, () => 0.99];

describe('makeQuestion', () => {
  it('asks an unlocked kana', () => {
    for (const rng of rngs) {
      const { kana } = makeQuestion(NEW_LEARNER, 'hiragana', NOW, rng);
      expect(['あ', 'い', 'う', 'え', 'お']).toContain(kana.char);
    }
  });

  it('offers four choices that include the answer', () => {
    for (const rng of rngs) {
      const { kana, choices } = makeQuestion(NEW_LEARNER, 'hiragana', NOW, rng);
      expect(choices).toHaveLength(4);
      expect(choices).toContain(kana);
    }
  });

  it("only asks kana the learner has met, not ones a newly opened row hasn't taught", () => {
    // The a row is green, so the ka row is open, but only か has been met there.
    const green = { box: 3, dueAt: 0 };
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: green, い: green, う: green, え: green, お: green, か: { box: 0, dueAt: 0 } },
    };
    for (const rng of rngs) {
      const { kana } = makeQuestion(progress, 'hiragana', NOW, rng);
      expect(['あ', 'い', 'う', 'え', 'お', 'か']).toContain(kana.char);
    }
  });

  it('uses the requested script', () => {
    const { kana, choices } = makeQuestion(NEW_LEARNER, 'katakana', NOW, () => 0.5);
    expect(kana.script).toBe('katakana');
    expect(choices.every((c) => c.script === 'katakana')).toBe(true);
  });
});

describe('makeDrillQuestion', () => {
  const KANA_ROW = { あ: { box: 3, dueAt: 0 }, い: { box: 3, dueAt: 0 }, う: { box: 3, dueAt: 0 }, え: { box: 3, dueAt: 0 } };
  const progress: Progress = {
    ...EMPTY_PROGRESS,
    kana: KANA_ROW,
    confusions: [{ shown: 'あ', guessed: 'お' }],
  };
  const focus = unlockedKana(progress, 'hiragana').find((k) => k.char === 'あ');

  it('asks the drilled kana about half the time', () => {
    if (!focus) throw new Error('あ should be unlocked');
    expect(makeDrillQuestion(progress, focus, NOW, () => 0.2).kana).toBe(focus);
  });

  it('otherwise asks a kana it gets mixed up with', () => {
    if (!focus) throw new Error('あ should be unlocked');
    expect(makeDrillQuestion(progress, focus, NOW, () => 0.7).kana.char).toBe('お');
  });

  it('offers four choices that include the answer', () => {
    if (!focus) throw new Error('あ should be unlocked');
    const { kana, choices } = makeDrillQuestion(progress, focus, NOW, () => 0.7);
    expect(choices).toHaveLength(4);
    expect(choices).toContain(kana);
  });
});

describe('never the same kana twice in a row', () => {
  const rngs = [() => 0, () => 0.3, () => 0.6, () => 0.99];

  it('makeQuestion avoids the kana just asked', () => {
    for (const rng of rngs) {
      expect(makeQuestion(NEW_LEARNER, 'hiragana', NOW, rng, 'あ').kana.char).not.toBe('あ');
    }
  });

  it('makeDrillQuestion asks a partner instead of repeating the drilled kana', () => {
    const progress: Progress = { ...EMPTY_PROGRESS, confusions: [{ shown: 'あ', guessed: 'お' }] };
    const focus = unlockedKana(progress, 'hiragana').find((k) => k.char === 'あ');
    if (!focus) throw new Error('あ should be unlocked');
    for (const rng of rngs) {
      expect(makeDrillQuestion(progress, focus, NOW, rng, 'あ').kana.char).toBe('お');
      expect(makeDrillQuestion(progress, focus, NOW, rng, 'お').kana.char).toBe('あ');
    }
  });

  it('still drills a kana with no partners, since it is the only one', () => {
    const focus = unlockedKana(NEW_LEARNER, 'hiragana').find((k) => k.char === 'い');
    if (!focus) throw new Error('い should be unlocked');
    expect(makeDrillQuestion(NEW_LEARNER, focus, NOW, () => 0.9, 'い').kana.char).toBe('い');
  });
});
