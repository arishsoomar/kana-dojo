import { EMPTY_PROGRESS } from './answers';
import { calligraphyKana, CALLIGRAPHY_ROUND, judgeStroke, resample, type Point } from './calligraphy';
import { KANA } from './kana';

// か's first stroke from KanjiVG, as points along it (a curve across and down).
const target: Point[] = Array.from({ length: 24 }, (_, i) => {
  const t = i / 23;
  return [25 + 38 * t, 38 + 45 * t * t] as const;
});
const shifted = (dx: number, dy: number) => target.map(([x, y]) => [x + dx, y + dy] as const);

describe('resample', () => {
  it('spaces points evenly along a line, keeping both ends', () => {
    const line = resample(
      [
        [0, 0],
        [10, 0],
        [30, 0],
      ],
      5,
    );
    expect(line).toEqual([
      [0, 0],
      [7.5, 0],
      [15, 0],
      [22.5, 0],
      [30, 0],
    ]);
  });
});

describe('judgeStroke', () => {
  it('is clean for a stroke right on the line, or just off it', () => {
    expect(judgeStroke(target, target)).toBe('clean');
    expect(judgeStroke(shifted(4, 3), target)).toBe('clean');
  });

  it('is okay for a stroke a little way off', () => {
    expect(judgeStroke(shifted(9, 6), target)).toBe('okay');
  });

  it('is off for a stroke somewhere else', () => {
    expect(judgeStroke(shifted(30, 0), target)).toBe('off');
  });

  it('notices a stroke drawn the wrong way round', () => {
    expect(judgeStroke([...target].reverse(), target)).toBe('backwards');
  });

  it('is off for a tap, or a stroke much too short', () => {
    expect(judgeStroke([[30, 40]], target)).toBe('off');
    expect(judgeStroke(target.slice(0, 4), target)).toBe('off');
  });

  it('judges the shape the same, however many points were drawn', () => {
    const dense = resample(target, 200);
    expect(judgeStroke(dense, target)).toBe('clean');
  });
});

describe('calligraphyKana', () => {
  it('picks a round of different kana from the pool', () => {
    const pool = KANA.filter((k) => 'あいうえおかきくけこ'.includes(k.char));
    const round = calligraphyKana(EMPTY_PROGRESS, pool, () => 0.5);
    expect(round).toHaveLength(CALLIGRAPHY_ROUND);
    expect(new Set(round).size).toBe(CALLIGRAPHY_ROUND);
  });

  it('picks all of a smaller pool', () => {
    const pool = KANA.filter((k) => 'あい'.includes(k.char));
    expect(calligraphyKana(EMPTY_PROGRESS, pool, () => 0.5)).toHaveLength(2);
  });
});
