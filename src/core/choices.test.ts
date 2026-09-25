import { makeChoices } from './choices';
import { KANA, type Kana } from './kana';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

const hiragana = KANA.filter((k) => k.script === 'hiragana');
const katakana = KANA.filter((k) => k.script === 'katakana');

// A few fake random sources, so each test runs against more than one shuffle.
const rngs = [() => 0, () => 0.5, () => 0.99];

describe('makeChoices', () => {
  it('returns four choices, one of them the answer', () => {
    for (const rng of rngs) {
      const choices = makeChoices(kana('か'), hiragana, rng);
      expect(choices).toHaveLength(4);
      expect(choices).toContain(kana('か'));
    }
  });

  it('includes lookalikes from the pool', () => {
    for (const rng of rngs) {
      expect(makeChoices(kana('シ'), katakana, rng)).toContain(kana('ツ'));
      const ne = makeChoices(kana('ね'), hiragana, rng);
      expect(ne).toContain(kana('わ'));
      expect(ne).toContain(kana('れ'));
    }
  });

  it('never repeats a romaji, even with both scripts in the pool', () => {
    for (const rng of rngs) {
      const romaji = makeChoices(kana('し'), KANA, rng).map((k) => k.romaji[0]);
      expect(new Set(romaji).size).toBe(4);
    }
  });

  it('lists the choices in kana-chart order, so each answer keeps its place', () => {
    for (const rng of rngs) {
      const choices = makeChoices(kana('う'), hiragana, rng);
      const positions = choices.map((k) => KANA.indexOf(k));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });
});
