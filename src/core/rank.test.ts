import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import type { Belt } from './boxes';
import { EXAM_PASS, examId } from './exam';
import { KANA, ROWS, type RowId, type Script } from './kana';
import { overallRank } from './rank';

const BOX_FOR: Record<Belt, number> = { white: 0, green: 3, brown: 6, black: 9 };
const EVERY_ROW: [Script, RowId][] = (['hiragana', 'katakana'] as const).flatMap((script) =>
  ROWS.map((row): [Script, RowId] => [script, row]),
);

// Progress where the first `count` rows (hiragana first) have earned `belt`: their kana
// are at that belt and the exam was passed.
function rowsEarned(count: number, belt: Belt, base: Progress = EMPTY_PROGRESS): Progress {
  let progress = base;
  for (const [script, row] of EVERY_ROW.slice(0, count)) {
    const kana = KANA.filter((k) => k.script === script && k.row === row);
    progress = { ...progress, kana: { ...progress.kana, ...Object.fromEntries(kana.map((k) => [k.char, { box: BOX_FOR[belt], at: 0 }])) } };
    progress = completeLesson(progress, examId(script, row, belt), 1000, EXAM_PASS);
  }
  return progress;
}

describe('overallRank', () => {
  it('starts white', () => {
    expect(overallRank(EMPTY_PROGRESS)).toBe('white');
  });

  it('is green once 3 rows have earned green', () => {
    expect(overallRank(rowsEarned(2, 'green'))).toBe('white');
    expect(overallRank(rowsEarned(3, 'green'))).toBe('green');
  });

  it('counts rows at a higher belt toward a lower rank', () => {
    expect(overallRank(rowsEarned(3, 'brown'))).toBe('green');
  });

  it('is brown once 10 rows have earned brown', () => {
    expect(overallRank(rowsEarned(9, 'brown'))).toBe('green');
    expect(overallRank(rowsEarned(10, 'brown'))).toBe('brown');
  });

  it('is black only when every row, in both scripts, is black', () => {
    const allRows = 2 * ROWS.length;
    expect(allRows).toBe(30);
    expect(overallRank(rowsEarned(allRows - 1, 'black'))).toBe('brown');
    expect(overallRank(rowsEarned(allRows, 'black'))).toBe('black');
  });

  it('only counts belts earned by exam, not just qualified for', () => {
    const qualifiedOnly = { ...EMPTY_PROGRESS, kana: Object.fromEntries(KANA.map((k) => [k.char, { box: 9, at: 0 }])) };
    expect(overallRank(qualifiedOnly)).toBe('white');
  });
});
