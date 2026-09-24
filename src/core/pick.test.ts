import type { Progress } from './answers';
import { KANA, type Kana } from './kana';
import { pickNext } from './pick';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

const NOW = 1_000_000;

// 100 evenly spaced "random" numbers, so picks can be counted like percentages.
const sweep = Array.from({ length: 100 }, (_, i) => i / 100);

function countPicks(progress: Progress, candidates: Kana[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of sweep) {
    const picked = pickNext(progress, candidates, NOW, () => value);
    counts[picked.char] = (counts[picked.char] ?? 0) + 1;
  }
  return counts;
}

describe('pickNext', () => {
  it('strongly favors a due kana over one that is not due', () => {
    const progress: Progress = {
      kana: { あ: { box: 3, dueAt: NOW - 1 }, い: { box: 3, dueAt: NOW + 60_000 } },
      confusions: [],
      stats: {},
    };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['あ']).toBeGreaterThan(85);
    expect(counts['い']).toBeGreaterThan(0);
  });

  it('favors a low box over a high box when both are due', () => {
    const progress: Progress = {
      kana: { あ: { box: 0, dueAt: NOW }, い: { box: 6, dueAt: NOW } },
      confusions: [],
      stats: {},
    };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['あ']).toBeGreaterThan(70);
  });

  it('treats a never-seen kana as box 0 and due', () => {
    const progress: Progress = { kana: { い: { box: 6, dueAt: NOW } }, confusions: [], stats: {} };
    const counts = countPicks(progress, [kana('あ'), kana('い')]);
    expect(counts['あ']).toBeGreaterThan(70);
  });

  it('only ever picks from the candidates', () => {
    const counts = countPicks({ kana: {}, confusions: [], stats: {} }, [kana('か'), kana('き')]);
    expect(Object.keys(counts).sort()).toEqual(['か', 'き']);
  });
});
