import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import { EXAM_PASS, examId } from './exam';
import { masteryGrid } from './grid';

const NEW_LEARNER: Progress = { ...EMPTY_PROGRESS, kana: {} };

describe('masteryGrid', () => {
  it('has every row in order, with 46 kana in total', () => {
    const grid = masteryGrid(NEW_LEARNER, 'hiragana');
    expect(grid.rows.map((r) => r.row)).toEqual(['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa']);
    expect(grid.total).toBe(46);
    expect(grid.rows.find((r) => r.row === 'ya')?.cells).toHaveLength(3);
  });

  it('shows a new learner the a row unlocked at white belt, and the rest locked', () => {
    const grid = masteryGrid(NEW_LEARNER, 'hiragana');
    const [aRow, kaRow] = grid.rows;
    expect(aRow?.cells.map((c) => [c.kana.char, c.belt, c.locked])).toEqual([
      ['あ', 'white', false],
      ['い', 'white', false],
      ['う', 'white', false],
      ['え', 'white', false],
      ['お', 'white', false],
    ]);
    expect(kaRow?.cells.every((c) => c.locked)).toBe(true);
    expect(grid.pastWhite).toBe(0);
  });

  it('gives each kana the belt for its box, and counts belts past white', () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: { あ: { box: 9, at: 0 }, い: { box: 6, at: 0 }, う: { box: 3, at: 0 }, え: { box: 4, at: 0 } },
    };
    const grid = masteryGrid(progress, 'hiragana');
    expect(grid.rows[0]?.cells.map((c) => c.belt)).toEqual(['black', 'brown', 'green', 'green', 'white']);
    expect(grid.pastWhite).toBe(4);
    expect(grid.counts).toEqual({ white: 42, green: 2, brown: 1, black: 1 });
  });

  it('keeps each script separate', () => {
    const progress: Progress = { ...EMPTY_PROGRESS, kana: { あ: { box: 9, at: 0 } } };
    expect(masteryGrid(progress, 'katakana').pastWhite).toBe(0);
  });
});

describe('masteryGrid: row belts', () => {
  it("says which belt each row qualifies for: the lowest among its kana", () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: {
        あ: { box: 9, at: 0 },
        い: { box: 9, at: 0 },
        う: { box: 6, at: 0 },
        え: { box: 3, at: 0 },
        お: { box: 9, at: 0 },
      },
    };
    const [aRow, kaRow] = masteryGrid(progress, 'hiragana').rows;
    expect(aRow?.qualified).toBe('green');
    expect(kaRow?.qualified).toBe('white');
  });

  it('shows white until the belt exam is passed', () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      kana: Object.fromEntries([...'あいうえお'].map((c) => [c, { box: 3, at: 0 }])),
    };
    expect(masteryGrid(progress, 'hiragana').rows[0]?.belt).toBe('white');
    const passed = completeLesson(progress, examId('hiragana', 'a', 'green'), 1000, EXAM_PASS);
    expect(masteryGrid(passed, 'hiragana').rows[0]?.belt).toBe('green');
  });
});
