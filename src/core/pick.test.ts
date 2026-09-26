import { EMPTY_PROGRESS, type Progress } from './answers';
import { KANA, type Kana } from './kana';
import { pickNext } from './pick';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

// 100 evenly spaced "random" numbers, so picks can be counted like percentages.
const sweep = Array.from({ length: 100 }, (_, i) => i / 100);

function countPicks(progress: Progress, candidates: Kana[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of sweep) {
    const picked = pickNext(progress, candidates, () => value);
    counts[picked.char] = (counts[picked.char] ?? 0) + 1;
  }
  return counts;
}

describe('pickNext', () => {
  it('favors a low box over a high box', () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 0, at: 1 }, い: { box: 6, at: 1 } },
    };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['あ']).toBeGreaterThan(70);
  });

  it('still sometimes picks a black-belt kana, so it gets reviewed', () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 0, at: 1 }, い: { box: 9, at: 1 } },
    };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['い']).toBeGreaterThan(0);
  });

  it('treats a never-seen kana as box 0', () => {
    const progress: Progress = { ...EMPTY_PROGRESS, kana: { い: { box: 6, at: 1 } } };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['あ']).toBeGreaterThan(70);
  });

  it('only ever picks from the candidates', () => {
    const counts = countPicks({ ...EMPTY_PROGRESS, kana: {} }, [kana('か'), kana('き')]);
    expect(Object.keys(counts).sort()).toEqual(['か', 'き']);
  });
});
