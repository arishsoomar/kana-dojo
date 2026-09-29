import { forgeWord } from '@/core/forge';
import { SIGNS_TO_OPEN, signRomaji } from '@/core/reading';

import { PLACES } from './signs';

describe('the signs', () => {
  const all = PLACES.flatMap((p) => p.signs.map((s) => ({ place: p.id, ...s })));

  it('writes every sign with kana the app teaches (and っ or ー), in one script', () => {
    const broken = all.filter((s) => {
      const found = forgeWord({ text: s.text, meaning: s.meaning, picture: '' });
      return found === null || new Set(found.units.map((k) => k.script)).size !== 1;
    });
    expect(broken.map((s) => s.text)).toEqual([]);
  });

  it('can read every sign aloud', () => {
    expect(all.filter((s) => signRomaji(s.text) === '').map((s) => s.text)).toEqual([]);
  });

  it('gives each place its own id, and enough signs to open', () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    for (const p of PLACES) expect(p.signs.length).toBeGreaterThanOrEqual(SIGNS_TO_OPEN);
  });

  it('never has two signs in a place that look or mean the same, so each question has one answer', () => {
    for (const p of PLACES) {
      expect(new Set(p.signs.map((s) => s.text)).size).toBe(p.signs.length);
      expect(new Set(p.signs.map((s) => s.meaning)).size).toBe(p.signs.length);
    }
  });
});
