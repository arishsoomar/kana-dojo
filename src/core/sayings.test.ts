import { EMPTY_PROGRESS, type Progress } from './answers';
import { SENSEI_LINES, karasuSays } from './sayings';

const NEW_LEARNER: Progress = EMPTY_PROGRESS;

describe('karasuSays', () => {
  it('says one of his sensei lines to a learner with nothing to go on', () => {
    for (const r of [0, 0.5, 0.99]) {
      expect(SENSEI_LINES).toContain(karasuSays(NEW_LEARNER, () => r));
    }
  });

  it("can point out the pair the learner mixes up most, with that pair's tip", () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      confusions: [
        { shown: 'あ', guessed: 'お' },
        { shown: 'お', guessed: 'あ' },
        { shown: 'い', guessed: 'う' },
      ],
    };
    // The personal lines come first, so a low random number picks the first of them.
    const line = karasuSays(progress, () => 0);
    expect(line).toContain('あ');
    expect(line).toContain('お');
    expect(line).toContain('dash');
  });

  it('can point out the trickiest kana, answered at least 3 times, with its memory tip', () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      stats: {
        あ: { seen: 5, correct: 5, recentMs: [] },
        う: { seen: 4, correct: 1, recentMs: [] },
        え: { seen: 2, correct: 0, recentMs: [] }, // too few answers to judge
      },
    };
    const line = karasuSays(progress, () => 0);
    expect(line).toContain('う');
    expect(line).toContain('ooh');
  });

  it('never changes the progress it was given', () => {
    const before = JSON.stringify(NEW_LEARNER);
    karasuSays(NEW_LEARNER, () => 0.3);
    expect(JSON.stringify(NEW_LEARNER)).toBe(before);
  });

  it('never says the same thing twice in a row', () => {
    const first = karasuSays(NEW_LEARNER, () => 0);
    for (const r of [0, 0.5, 0.99]) {
      expect(karasuSays(NEW_LEARNER, () => r, first)).not.toBe(first);
    }
  });
});
