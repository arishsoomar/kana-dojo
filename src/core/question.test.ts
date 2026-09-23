import type { Progress } from './answers';
import { makeQuestion } from './question';

const NEW_LEARNER: Progress = { kana: {}, confusions: [] };
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
