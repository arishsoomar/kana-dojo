import { intervalFor, tierOf } from '@/core/boxes';
import { KANA } from '@/core/kana';
import { EMPTY_PROGRESS } from '@/core/answers';
import { greenNeeded } from '@/core/unlock';

import { BELT_STEPS, GUIDE } from './guide';

// Some of the guide is written out by hand. These fail if the rules it describes change,
// as a reminder to update the guide too.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('the guide', () => {
  it('describes the belt ladder the engine uses', () => {
    expect(BELT_STEPS.map((s) => s.belt)).toEqual(['white', 'green', 'brown', 'black']);
    // Green after 3 steps, brown after 5, black after 7.
    expect([tierOf(2), tierOf(3), tierOf(4), tierOf(5), tierOf(6), tierOf(7)]).toEqual([
      'white', 'green', 'green', 'brown', 'brown', 'black',
    ]);
    // No waits below green, then 20 minutes, 6 hours, 2 days and a week.
    expect([0, 1, 2, 3, 4, 5, 6].map(intervalFor)).toEqual([0, 0, 0, 20 * MINUTE, 6 * HOUR, 2 * DAY, 7 * DAY]);
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
