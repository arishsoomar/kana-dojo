import { tierOf } from '@/core/boxes';
import { KANA } from '@/core/kana';
import { climbLimit, EMPTY_PROGRESS } from '@/core/answers';
import { greenNeeded } from '@/core/unlock';

import { BELT_STEPS, GUIDE } from './guide';

// Some of the guide is written out by hand. These fail if the rules it describes change,
// as a reminder to update the guide too.

describe('the guide', () => {
  it('describes the belt ladder the engine uses', () => {
    expect(BELT_STEPS.map((s) => s.belt)).toEqual(['white', 'green', 'brown', 'black']);
    // Three steps to each belt.
    expect([2, 3, 5, 6, 8, 9].map(tierOf)).toEqual(['white', 'green', 'green', 'brown', 'brown', 'black']);
    // The speed limits it quotes, tapped and typed.
    expect([0, 3, 6].map((box) => climbLimit(box, false))).toEqual([4000, 2500, 1500]);
    expect([0, 3, 6].map((box) => climbLimit(box, true))).toEqual([6000, 4000, 3000]);
  });

  it('says the next row opens at 4 of the あ row\'s 5 kana', () => {
    expect(KANA.filter((k) => k.script === 'hiragana' && k.row === 'a')).toHaveLength(5);
    expect(greenNeeded(EMPTY_PROGRESS, 'hiragana', 'a')).toBe(4);
  });

  it('gives every question a unique id and an answer', () => {
    const topics = GUIDE.flatMap((s) => s.topics);
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    for (const topic of topics) expect(topic.answer.length).toBeGreaterThan(0);
  });
});
