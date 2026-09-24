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
