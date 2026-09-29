import { EMPTY_PROGRESS, type Completion, type Progress } from './answers';
import { bonsaiStage, dojoRoom } from './dojo';
import { duelId } from './duel';
import { examId } from './exam';
import { KANA, rowsOf } from './kana';
import { NAMED_PAIRS } from './pairs';

// Every hiragana and katakana at `box`, and these finished records.
function learner(completed: Completion[], box = 3): Progress {
  return { ...EMPTY_PROGRESS, kana: Object.fromEntries(KANA.map((k) => [k.char, { box, at: 1 }])), completed };
}

const NONE = { streak: 0, moons: 0 };

describe('plaques', () => {
  it('has none before any belt exam is passed', () => {
    expect(dojoRoom(learner([]), NONE).plaques).toEqual([]);
  });

  it('hangs one for each row with a belt earned by exam, in either script, with its kana and belt', () => {
    const room = dojoRoom(
      learner([
        { lesson: examId('hiragana', 'a', 'green'), at: 1, score: 19 },
        { lesson: examId('katakana', 'ka', 'green'), at: 2, score: 18 },
        { lesson: examId('hiragana', 'ka', 'green'), at: 3, score: 12 }, // failed
      ]),
      NONE,
    );
    expect(room.plaques).toEqual([
      { script: 'hiragana', row: 'a', kana: 'あいうえお', belt: 'green' },
      { script: 'katakana', row: 'ka', kana: 'カキクケコ', belt: 'green' },
    ]);
  });

  it('counts every row in both scripts as a place for a plaque', () => {
    expect(dojoRoom(learner([]), NONE).rowCount).toBe(rowsOf('hiragana').length + rowsOf('katakana').length);
  });
});

describe('the scroll', () => {
  const [first, second] = NAMED_PAIRS;
  if (!first || !second) throw new Error('needs two named pairs');

  it('is empty until a duel is won', () => {
    const lost = learner([{ lesson: duelId(first), at: 1, score: 3, opponent: 5 }]);
    expect(dojoRoom(lost, NONE)).toMatchObject({ scroll: null, scrollsWon: 0 });
  });

  it('shows the most recently won pair, and counts the scrolls won', () => {
    const room = dojoRoom(
      learner([
        { lesson: duelId(first), at: 1, score: 10, opponent: 1 },
        { lesson: duelId(second), at: 2, score: 10, opponent: 0 },
      ]),
      NONE,
    );
    expect(room.scroll).toEqual({ kana: second.kana, name: second.name });
    expect(room.scrollsWon).toBe(2);
  });
});

describe('the weapon rack', () => {
  it('has an empty slot for each game not played yet', () => {
    expect(dojoRoom(learner([]), NONE).rack).toEqual([
      { game: 'rain', value: null },
      { game: 'dungeon', value: null },
      { game: 'taiko', value: null },
      { game: 'memory', value: null },
    ]);
  });

  it("holds each game's record: best score, deepest floor, fewest moves", () => {
    const room = dojoRoom(
      learner([
        { lesson: 'game:rain', at: 1, score: 900 },
        { lesson: 'game:rain', at: 2, score: 1840 },
        { lesson: 'game:dungeon:hiragana', at: 3, score: 4 },
        { lesson: 'game:dungeon:katakana', at: 4, score: 7 },
        { lesson: 'game:taiko:katakana', at: 5, score: 5200 },
        { lesson: 'game:memory:hiragana', at: 6, score: 22 },
        { lesson: 'game:memory:both', at: 7, score: 14 },
      ]),
      NONE,
    );
    expect(room.rack).toEqual([
      { game: 'rain', value: 1840 },
      { game: 'dungeon', value: 7 },
      { game: 'taiko', value: 5200 },
      { game: 'memory', value: 14 },
    ]);
  });
});

describe('the bonsai and lanterns', () => {
  it('grows the bonsai with the streak', () => {
    expect([0, 1, 6, 7, 29, 30, 99, 100, 400].map(bonsaiStage)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(dojoRoom(learner([]), { streak: 30, moons: 0 }).bonsai).toBe(3);
  });

  it('hangs a lantern for each moon', () => {
    expect(dojoRoom(learner([]), { streak: 0, moons: 2 }).lanterns).toBe(2);
  });
});

it('does not change the progress it was given', () => {
  const progress = learner([{ lesson: examId('hiragana', 'a', 'green'), at: 1, score: 19 }]);
  const before = JSON.stringify(progress);
  dojoRoom(progress, NONE);
  expect(JSON.stringify(progress)).toBe(before);
});
