import { EMPTY_PROGRESS, type Confusion, type Progress } from './answers';
import {
  completeDuel,
  DUEL_LOSS,
  DUEL_READY_MIXUPS,
  DUEL_WIN,
  duelId,
  duelQuestion,
  duelRow,
  duelStatus,
  scorePoint,
  scrolls,
  weakPairs,
  type DuelScore,
} from './duel';
import { KANA } from './kana';
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

describe('duelQuestion', () => {
  const shadowTwins = NAMED_PAIRS.find(({ kana }) => kana.includes('シ') && kana.includes('ツ'));

  it("asks one of the pair's two kana, picked at random", () => {
    if (!shadowTwins) throw new Error('missing pair');
    const asked = [() => 0, () => 0.99].map((rng) => duelQuestion(shadowTwins, rng).kana.char);
    expect(asked.sort()).toEqual(['シ', 'ツ']);
  });

  it("offers only the pair's two kana, in kana-chart order", () => {
    if (!shadowTwins) throw new Error('missing pair');
    const { choices } = duelQuestion(shadowTwins, () => 0.5);
    expect(choices.map((k) => k.char)).toEqual(['シ', 'ツ']);
    expect(KANA.indexOf(choices[0]!)).toBeLessThan(KANA.indexOf(choices[1]!));
  });

  it('can ask the same kana again: with two kana, taking turns would give the answer away', () => {
    if (!shadowTwins) throw new Error('missing pair');
    expect(duelQuestion(shadowTwins, () => 0).kana).toBe(duelQuestion(shadowTwins, () => 0).kana);
  });
});

describe('scorePoint', () => {
  const start: DuelScore = { mine: 0, theirs: 0 };

  it('gives me a point for a right answer under 4 seconds', () => {
    expect(scorePoint(start, { correct: true, ms: 3999 })).toEqual({ mine: 1, theirs: 0 });
  });

  it('gives the opponent a point for a wrong answer, however fast', () => {
    expect(scorePoint(start, { correct: false, ms: 500 })).toEqual({ mine: 0, theirs: 1 });
  });

  it('gives nobody a point for a slow right answer', () => {
    expect(scorePoint(start, { correct: true, ms: 4000 })).toEqual(start);
  });

  it('changes nothing once the duel is over', () => {
    const won = { mine: DUEL_WIN, theirs: 2 };
    expect(scorePoint(won, { correct: false, ms: 500 })).toEqual(won);
  });

  it('never changes the score it was given', () => {
    const score = { mine: 3, theirs: 1 };
    scorePoint(score, { correct: true, ms: 1000 });
    expect(score).toEqual({ mine: 3, theirs: 1 });
  });
});

describe('duelStatus', () => {
  it(`is going until I reach ${DUEL_WIN} or the opponent reaches ${DUEL_LOSS}`, () => {
    expect(duelStatus({ mine: DUEL_WIN - 1, theirs: DUEL_LOSS - 1 })).toBe('going');
  });

  it(`is won at ${DUEL_WIN}`, () => {
    expect(duelStatus({ mine: DUEL_WIN, theirs: 3 })).toBe('won');
  });

  it(`is lost when the opponent reaches ${DUEL_LOSS}`, () => {
    expect(duelStatus({ mine: 7, theirs: DUEL_LOSS })).toBe('lost');
  });
});

describe('completeDuel', () => {
  it('records the duel with both scores, keeping earlier records', () => {
    const pair = NAMED_PAIRS[0]!;
    const before = { ...EMPTY_PROGRESS, completed: [{ lesson: 'hiragana:a:0', at: 1 }] };
    const after = completeDuel(before, pair, { mine: 10, theirs: 3 }, 500);
    expect(after.completed).toEqual([
      { lesson: 'hiragana:a:0', at: 1 },
      { lesson: duelId(pair), at: 500, score: 10, opponent: 3 },
    ]);
    expect(duelId(pair)).toBe('duel:あお');
    expect(before.completed).toHaveLength(1);
  });
});

describe('scrolls', () => {
  const pair = NAMED_PAIRS[0]!; // あ お: the a row, open from the start
  const mixedUp = withMixUps(['あ', 'お'], ['お', 'あ'], ['あ', 'お']);
  const scrollFor = (progress: Progress) => scrolls(progress).find((s) => s.pair === pair);

  it('has one scroll per named pair', () => {
    expect(scrolls(EMPTY_PROGRESS)).toHaveLength(NAMED_PAIRS.length);
  });

  it('is locked until the pair is ready to duel, then ready', () => {
    expect(scrollFor(EMPTY_PROGRESS)?.state).toBe('locked');
    expect(scrollFor(mixedUp)?.state).toBe('ready');
  });

  it('is won by the first winning duel, keeping its date and score', () => {
    const progress = [
      { at: 10, mine: 6, theirs: 5 }, // lost
      { at: 20, mine: 10, theirs: 3 }, // first win
      { at: 30, mine: 10, theirs: 0 }, // a later win
    ].reduce((p, { at, mine, theirs }) => completeDuel(p, pair, { mine, theirs }, at), mixedUp);
    expect(scrollFor(progress)).toMatchObject({ state: 'won', firstWin: { at: 20, score: { mine: 10, theirs: 3 } } });
  });

  it('stays ready after a lost duel', () => {
    const progress = completeDuel(mixedUp, pair, { mine: 4, theirs: 5 }, 10);
    expect(scrollFor(progress)).toMatchObject({ state: 'ready', firstWin: null });
  });

  it('lists won scrolls first, then ready ones, then locked ones', () => {
    // The a and ka rows are green, so the sa row is open and き さ can be ready.
    const green = { box: 3, dueAt: 0 };
    const opened = {
      ...withMixUps(['き', 'さ'], ['さ', 'き'], ['き', 'さ']),
      kana: Object.fromEntries([...'あいうえおかきくけこ'].map((char) => [char, green])),
    };
    const progress = completeDuel(opened, pair, { mine: 10, theirs: 0 }, 5);
    const states = scrolls(progress).map((s) => s.state);
    expect(states.slice(0, 2)).toEqual(['won', 'ready']);
    expect(states.slice(2).every((state) => state === 'locked')).toBe(true);
  });

  it('says which row has to open first, for a pair whose kana are still locked', () => {
    const shadowTwins = scrolls(EMPTY_PROGRESS).find((s) => s.pair.kana.includes('シ') && s.pair.kana.includes('ツ'));
    // シ is in the sa row and ツ in the ta row: the ta row opens last.
    expect(shadowTwins?.opensWith?.char).toBe('タ');
  });

  it("has nothing to open for a pair whose kana are unlocked", () => {
    expect(scrollFor(EMPTY_PROGRESS)?.opensWith).toBeNull();
  });
});

describe('duelRow', () => {
  const find = (a: string, b: string) => NAMED_PAIRS.find(({ kana }) => kana.includes(a) && kana.includes(b))!;

  it("is the pair's script and the later of its two kana's rows", () => {
    expect(duelRow(find('あ', 'お'))).toEqual({ script: 'hiragana', row: 'a' });
    expect(duelRow(find('き', 'さ'))).toEqual({ script: 'hiragana', row: 'sa' });
    expect(duelRow(find('シ', 'ツ'))).toEqual({ script: 'katakana', row: 'ta' });
  });
});
