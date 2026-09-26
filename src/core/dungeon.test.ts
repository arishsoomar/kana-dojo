import {
  answerRun,
  attackMs,
  charmChoices,
  CHARMS,
  dungeonId,
  floorPlan,
  HINTS_PER_FLOOR,
  MAX_HEARTS,
  startRun,
  takeCharm,
  spendHint,
  type Charm,
  type Run,
} from './dungeon';

const rng = () => 0.5;
const right = (ms = 3000) => ({ correct: true, ms });
const wrong = { correct: false, ms: 1000 };

// A run on a given floor, with some charms, and the rest as a new run has it.
function runOn(floor: number, charms: Charm[] = []): Run {
  let run = startRun(rng);
  for (let f = 1; f < floor; f++) run = takeCharm(run, 'tea', rng);
  return { ...run, charms, shieldReady: charms.includes('omamori'), hintsLeft: charms.includes('hint') ? HINTS_PER_FLOOR : 0 };
}

describe('floors', () => {
  it('get more yokai: 3 on floor 1, one more each floor, up to 6', () => {
    expect([1, 2, 3, 4, 5, 9].map((f) => floorPlan(f).enemies)).toEqual([3, 4, 5, 6, 6, 6]);
  });

  it('get tougher yokai: 1 HP, then one more every 3 floors, up to 3', () => {
    expect([1, 3, 4, 6, 7, 20].map((f) => floorPlan(f).hp)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('attack sooner: 5 seconds on floor 1, 8% faster each floor, never under 2 seconds', () => {
    expect(attackMs(1, [])).toBe(5000);
    expect(attackMs(2, [])).toBe(4600);
    expect(attackMs(30, [])).toBe(2000);
  });

  it('attack 20% slower with the paper lantern', () => {
    expect(attackMs(1, ['lantern'])).toBe(6000);
  });

  it("keeps each script's deepest floor apart", () => {
    expect(dungeonId('hiragana')).not.toBe(dungeonId('katakana'));
  });
});

describe('startRun', () => {
  it('starts on floor 1 with full hearts, no charms, and the first yokai', () => {
    const run = startRun(rng);
    expect(run.floor).toBe(1);
    expect(run.hearts).toBe(MAX_HEARTS);
    expect(run.charms).toEqual([]);
    expect(run.enemiesLeft).toBe(3);
    expect(run.enemy.hp).toBe(1);
    expect(run.enemy.name.length).toBeGreaterThan(0);
    expect(run.over).toBe(false);
  });
});

describe('answerRun: striking', () => {
  it('strikes once for a right answer, and says when it was clean (under 1.5s)', () => {
    const { run, blow } = answerRun(runOn(4), right(1000), rng);
    expect(blow).toEqual({ kind: 'strike', clean: true, damage: 1, defeated: false, floorCleared: false });
    expect(run.enemy.hp).toBe(1);
    expect(answerRun(runOn(4), right(2000), rng).blow).toMatchObject({ kind: 'strike', clean: false, damage: 1 });
  });

  it('strikes twice for a clean answer with the sharp bokken, but once for a slow one', () => {
    expect(answerRun(runOn(4, ['bokken']), right(1000), rng).blow).toMatchObject({ damage: 2, defeated: true });
    expect(answerRun(runOn(4, ['bokken']), right(2000), rng).blow).toMatchObject({ damage: 1, defeated: false });
  });

  it('brings on the next yokai when one is defeated', () => {
    const { run, blow } = answerRun(startRun(rng), right(), rng);
    expect(blow).toMatchObject({ defeated: true, floorCleared: false });
    expect(run.enemiesLeft).toBe(2);
    expect(run.enemy.hp).toBe(1);
  });

  it('clears the floor with the last yokai', () => {
    let run = startRun(rng);
    let last = answerRun(run, right(), rng);
    for (let i = 0; i < 2; i++) {
      run = last.run;
      last = answerRun(run, right(), rng);
    }
    expect(last.blow).toMatchObject({ defeated: true, floorCleared: true });
    expect(last.run.enemiesLeft).toBe(0);
  });

  it('never changes the run it was given', () => {
    const run = startRun(rng);
    const snapshot = structuredClone(run);
    answerRun(run, right(), rng);
    answerRun(run, wrong, rng);
    expect(run).toEqual(snapshot);
  });
});

describe('answerRun: getting hit', () => {
  it('costs a heart for a wrong answer or a timeout', () => {
    expect(answerRun(startRun(rng), wrong, rng).run.hearts).toBe(MAX_HEARTS - 1);
    expect(answerRun(startRun(rng), null, rng).run.hearts).toBe(MAX_HEARTS - 1);
    expect(answerRun(startRun(rng), wrong, rng).blow).toEqual({ kind: 'hurt', shielded: false, over: false });
  });

  it('ends the run at 0 hearts, and then nothing changes', () => {
    const run = { ...startRun(rng), hearts: 1 };
    const { run: after, blow } = answerRun(run, wrong, rng);
    expect(blow).toEqual({ kind: 'hurt', shielded: false, over: true });
    expect(after.over).toBe(true);
    expect(answerRun(after, right(), rng).run).toEqual(after);
  });

  it('lets the omamori take the first mistake on a floor, then not the second', () => {
    const first = answerRun(runOn(1, ['omamori']), wrong, rng);
    expect(first.blow).toEqual({ kind: 'hurt', shielded: true, over: false });
    expect(first.run.hearts).toBe(MAX_HEARTS);
    expect(answerRun(first.run, wrong, rng).run.hearts).toBe(MAX_HEARTS - 1);
  });
});

describe('charms', () => {
  it('offers three different charms, none already taken, except tea', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const offered = charmChoices({ ...startRun(rng), charms: ['lantern', 'hint'] }, () => r);
      expect(offered).toHaveLength(3);
      expect(new Set(offered).size).toBe(3);
      expect(offered).not.toContain('lantern');
      expect(offered).not.toContain('hint');
    }
  });

  it('offers fewer when fewer are left', () => {
    const offered = charmChoices({ ...startRun(rng), charms: ['lantern', 'hint', 'bokken', 'omamori'] }, rng);
    expect(offered).toEqual(['tea']);
  });

  it('has a name, a rarity and a description for each', () => {
    expect(CHARMS.omamori).toMatchObject({ name: 'Lucky omamori', rarity: 'epic' });
    expect(CHARMS.lantern.rarity).toBe('common');
  });

  it('goes down to the next floor after one is taken, keeping it', () => {
    const run = takeCharm(startRun(rng), 'lantern', rng);
    expect(run.floor).toBe(2);
    expect(run.charms).toEqual(['lantern']);
    expect(run.enemiesLeft).toBe(4);
  });

  it('gives 2 hearts back with healing tea, up to the most, and keeps no tea', () => {
    expect(takeCharm({ ...startRun(rng), hearts: 2 }, 'tea', rng).hearts).toBe(4);
    expect(takeCharm({ ...startRun(rng), hearts: 4 }, 'tea', rng).hearts).toBe(MAX_HEARTS);
    expect(takeCharm(startRun(rng), 'tea', rng).charms).toEqual([]);
  });

  it('refills the hint scroll and the omamori on every new floor', () => {
    let run = takeCharm(startRun(rng), 'hint', rng);
    expect(run.hintsLeft).toBe(HINTS_PER_FLOOR);
    run = spendHint(spendHint(run));
    expect(run.hintsLeft).toBe(1);
    run = takeCharm(run, 'omamori', rng);
    expect(run.hintsLeft).toBe(HINTS_PER_FLOOR);
    expect(run.shieldReady).toBe(true);
  });

  it('never uses a hint that is not there', () => {
    expect(spendHint(startRun(rng)).hintsLeft).toBe(0);
  });
});
