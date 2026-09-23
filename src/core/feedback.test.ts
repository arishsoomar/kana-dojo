import { recordAnswer, type Progress } from './answers';
import { beltChange, tipFor } from './feedback';
import { KANA, type Kana } from './kana';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

const NOW = 1_000_000;

function withBox(box: number): Progress {
  return { kana: { ぬ: { box, dueAt: NOW } }, confusions: [] };
}

describe('beltChange', () => {
  it('reports a promotion to a new belt', () => {
    const before = withBox(2);
    const after = recordAnswer(before, { char: 'ぬ', guess: 'ぬ', ms: 900, now: NOW });
    expect(beltChange(before, after, 'ぬ')).toEqual({ from: 'white', to: 'green' });
  });

  it('reports a drop to a lower belt', () => {
    const before = withBox(3);
    const after = recordAnswer(before, { char: 'ぬ', guess: 'め', ms: 900, now: NOW });
    expect(beltChange(before, after, 'ぬ')).toEqual({ from: 'green', to: 'white' });
  });

  it('returns null when the belt stays the same', () => {
    const before = withBox(0);
    const after = recordAnswer(before, { char: 'ぬ', guess: 'ぬ', ms: 900, now: NOW });
    expect(beltChange(before, after, 'ぬ')).toBeNull();
  });
});

describe('tipFor', () => {
  it('gives the lookalike tip for a known pair, in either order', () => {
    const tip = tipFor(kana('ぬ'), kana('め'));
    expect(tip).toContain('loop');
    expect(tipFor(kana('め'), kana('ぬ'))).toBe(tip);
  });

  it('falls back to naming both sounds for other mix-ups', () => {
    expect(tipFor(kana('か'), kana('き'))).toBe('か is "ka". き is "ki".');
  });
});
