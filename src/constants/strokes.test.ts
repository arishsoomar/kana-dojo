import { KANA } from '@/core/kana';

import { STROKES } from './strokes';

describe('stroke data', () => {
  it('has the strokes of every single-character kana', () => {
    const single = KANA.filter((k) => k.char.length === 1);
    expect(single).toHaveLength(142);
    expect(single.filter((k) => !STROKES[k.char]?.length).map((k) => k.char)).toEqual([]);
  });

  it('has 24 points along every stroke', () => {
    for (const strokes of Object.values(STROKES)) for (const stroke of strokes) expect(stroke.points).toHaveLength(24);
  });

  it('knows か has three strokes and し has one', () => {
    expect(STROKES['か']).toHaveLength(3);
    expect(STROKES['し']).toHaveLength(1);
  });
});
