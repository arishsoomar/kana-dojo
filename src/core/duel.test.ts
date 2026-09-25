import { EMPTY_PROGRESS, type Confusion, type Progress } from './answers';
import { DUEL_READY_MIXUPS, weakPairs } from './duel';
import { NAMED_PAIRS } from './pairs';

function withMixUps(...confusions: [string, string][]): Progress {
  return {
    ...EMPTY_PROGRESS,
    confusions: confusions.map(([shown, guessed]): Confusion => ({ shown, guessed })),
  };
}

function entryFor(progress: Progress, a: string, b: string) {
  const entry = weakPairs(progress).find(({ pair }) => pair.kana.includes(a) && pair.kana.includes(b));
  if (!entry) throw new Error(`No named pair ${a} ${b}`);
  return entry;
}

describe('weakPairs', () => {
  it('lists every named pair', () => {
    expect(weakPairs(EMPTY_PROGRESS)).toHaveLength(NAMED_PAIRS.length);
  });

  it('counts mix-ups in both directions, and only between the two kana', () => {
    const progress = withMixUps(['あ', 'お'], ['お', 'あ'], ['あ', 'お'], ['あ', 'い']);
    expect(entryFor(progress, 'あ', 'お').mixUps).toBe(3);
  });

  it('puts the most mixed-up pair first', () => {
    const progress = withMixUps(['あ', 'お'], ['き', 'さ'], ['さ', 'き']);
    const [first, second] = weakPairs(progress);
    expect(first?.pair.kana).toEqual(expect.arrayContaining(['き', 'さ']));
    expect(second?.pair.kana).toEqual(expect.arrayContaining(['あ', 'お']));
  });

  it(`is ready to duel at ${DUEL_READY_MIXUPS} mix-ups, not before`, () => {
    expect(entryFor(withMixUps(['あ', 'お'], ['お', 'あ']), 'あ', 'お').ready).toBe(false);
    expect(entryFor(withMixUps(['あ', 'お'], ['お', 'あ'], ['あ', 'お']), 'あ', 'お').ready).toBe(true);
  });

  it("isn't ready while either kana is still locked", () => {
    // シ and ツ are in the sa and ta rows, which a new learner hasn't opened.
    const progress = withMixUps(['シ', 'ツ'], ['シ', 'ツ'], ['ツ', 'シ'], ['ツ', 'シ']);
    expect(entryFor(progress, 'シ', 'ツ').ready).toBe(false);
  });
});
