import { EMPTY_PROGRESS, type Progress } from './answers';
import {
  ASSIGNMENTS_FROM,
  ASSIGNMENTS_PER_DAY,
  assignmentsDone,
  assignmentsOn,
  MONTH_GOAL,
  monthChallenge,
  moonsEarned,
  type AssignmentKind,
} from './assignments';
import { MON, monEarned } from './mon';

// A history of finished lessons and games: [day, lesson id, score?]. Returns the progress and
// each record's day, the way the app works them out from the device's timezone.
type Row = [string, string, number?];
function history(rows: readonly Row[]): { progress: Progress; days: string[] } {
  return {
    progress: {
      ...EMPTY_PROGRESS,
      completed: rows.map(([, lesson, score], i) => (score === undefined ? { lesson, at: i + 1 } : { lesson, at: i + 1, score })),
    },
    days: rows.map(([day]) => day),
  };
}

const DAY = '2026-10-05';
const BEFORE = '2026-10-04';
const kinds = (list: { kind: AssignmentKind }[]) => list.map((a) => a.kind);

// Someone who has played every game (and a drill) before today.
const VETERAN: Row[] = [
  [BEFORE, 'game:rain'],
  [BEFORE, 'game:dungeon:hiragana', 2],
  [BEFORE, 'game:memory:hiragana', 20],
  [BEFORE, 'game:taiko:hiragana', 900],
  [BEFORE, 'game:calligraphy', 5],
  [BEFORE, 'game:forge', 4],
  [BEFORE, `game:kata:${BEFORE}`, 18],
  [BEFORE, 'drill:ぬ'],
];

describe("a day's assignments", () => {
  it(`gives ${ASSIGNMENTS_PER_DAY} different assignments`, () => {
    const { progress, days } = history(VETERAN);
    const list = assignmentsOn(progress, days, DAY);
    expect(list).toHaveLength(ASSIGNMENTS_PER_DAY);
    expect(new Set(kinds(list)).size).toBe(ASSIGNMENTS_PER_DAY);
  });

  it('gives a newcomer only the three that need no history', () => {
    const { progress, days } = history([]);
    expect(kinds(assignmentsOn(progress, days, DAY)).sort()).toEqual(['games', 'lessons', 'xp']);
  });

  it('gives one of the first three kinds and two of the rest, once there are enough', () => {
    const { progress, days } = history(VETERAN);
    const list = kinds(assignmentsOn(progress, days, DAY));
    expect(list.filter((k) => ['lessons', 'xp', 'games'].includes(k))).toHaveLength(1);
  });

  it("only sets a game's assignment once it has been played on an earlier day", () => {
    const { progress, days } = history([[DAY, 'game:rain']]);
    expect(kinds(assignmentsOn(progress, days, DAY))).not.toContain('rain');
  });

  it("doesn't change during the day as things are finished", () => {
    const before = history(VETERAN);
    const after = history([...VETERAN, [DAY, 'game:rain'], [DAY, 'drill:め'], [DAY, 'hiragana:a:0', 120]]);
    expect(kinds(assignmentsOn(after.progress, after.days, DAY))).toEqual(kinds(assignmentsOn(before.progress, before.days, DAY)));
  });

  it('changes from day to day', () => {
    const { progress, days } = history(VETERAN);
    const week = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'].map((d) => kinds(assignmentsOn(progress, days, d)).join());
    expect(new Set(week).size).toBeGreaterThan(1);
  });

  it(`has none before ${ASSIGNMENTS_FROM}`, () => {
    const { progress, days } = history(VETERAN);
    expect(assignmentsOn(progress, days, '2026-09-27')).toEqual([]);
    expect(assignmentsOn(progress, days, ASSIGNMENTS_FROM)).toHaveLength(ASSIGNMENTS_PER_DAY);
  });
});

describe('progress on an assignment', () => {
  // Finds the day's assignment of a kind, whichever day sets it.
  function find(rows: Row[], kind: AssignmentKind) {
    for (let d = 1; d <= 28; d++) {
      const day = `2026-11-${String(d).padStart(2, '0')}`;
      const { progress, days } = history(rows.map(([rowDay, id, score]) => [rowDay === 'TODAY' ? day : rowDay, id, score]));
      const found = assignmentsOn(progress, days, day).find((a) => a.kind === kind);
      if (found) return found;
    }
    throw new Error(`no day sets ${kind}`);
  }

  it('counts lessons finished today, but not games, exams or duels, or other days', () => {
    const rows: Row[] = [
      [BEFORE, 'hiragana:a:0'],
      ['TODAY', 'hiragana:a:0'],
      ['TODAY', 'drill:ぬ'],
      ['TODAY', 'game:rain'],
      ['TODAY', 'exam:hiragana:a:green', 10],
    ];
    expect(find(rows, 'lessons')).toMatchObject({ count: 2, target: 3, done: false });
  });

  it("adds up the XP of today's lessons", () => {
    const rows: Row[] = [['TODAY', 'hiragana:a:0', 120], ['TODAY', 'practice:hiragana', 95], ['TODAY', 'game:rain', 900]];
    expect(find(rows, 'xp')).toMatchObject({ count: 200, target: 200, done: true });
  });

  it('counts games, and never counts past the target', () => {
    const rows: Row[] = [['TODAY', 'game:rain'], ['TODAY', 'game:forge', 3], ['TODAY', 'game:memory:both', 12]];
    expect(find(rows, 'games')).toMatchObject({ count: 2, target: 2, done: true });
  });

  it("takes the dungeon's deepest floor today", () => {
    const rows: Row[] = [...VETERAN, ['TODAY', 'game:dungeon:katakana', 2], ['TODAY', 'game:dungeon:hiragana', 1]];
    expect(find(rows, 'dungeon')).toMatchObject({ count: 2, target: 3, done: false });
  });

  it('adds up words read in Word Forge', () => {
    const rows: Row[] = [...VETERAN, ['TODAY', 'game:forge', 6], ['TODAY', 'game:forge', 5]];
    expect(find(rows, 'forge')).toMatchObject({ count: 10, target: 10, done: true });
  });

  it("counts drills and duels as settled mix-ups", () => {
    const rows: Row[] = [...VETERAN, ['TODAY', 'drill:め'], ['TODAY', 'duel:nu-me', 8]];
    expect(find(rows, 'mixups')).toMatchObject({ count: 2, done: true });
  });

  it('adds up words reviewed, once reviewing has started on an earlier day', () => {
    const rows: Row[] = [...VETERAN, [BEFORE, 'words:review', 5], ['TODAY', 'words:review', 12], ['TODAY', 'words:review', 9]];
    expect(find(rows, 'reviews')).toMatchObject({ count: 20, target: 20, done: true });
  });

  it('does not count a review session as a lesson, or its cards as XP', () => {
    const rows: Row[] = [['TODAY', 'words:review', 30]];
    expect(find(rows, 'lessons')).toMatchObject({ count: 0 });
    expect(find(rows, 'xp')).toMatchObject({ count: 0 });
  });

  it("counts the daily kata", () => {
    const rows: Row[] = [...VETERAN, ['TODAY', 'game:kata:x', 12]];
    expect(find(rows, 'kata')).toMatchObject({ count: 1, done: true });
  });
});

describe('assignments done, the month and mon', () => {
  // Three lessons a day, each worth 200 XP, and two games: every always-on assignment is done.
  const busyDay = (day: string): Row[] => [
    [day, 'hiragana:a:0', 200],
    [day, 'hiragana:a:1', 200],
    [day, 'practice:hiragana', 200],
    [day, 'game:rain'],
    [day, 'game:rain'],
  ];

  it("counts a newcomer's busy day as all three done", () => {
    const { progress, days } = history(busyDay(DAY));
    expect(assignmentsDone(progress, days)).toBe(3);
  });

  it(`counts nothing from before ${ASSIGNMENTS_FROM}`, () => {
    const { progress, days } = history(busyDay('2026-09-20'));
    expect(assignmentsDone(progress, days)).toBe(0);
  });

  it('earns mon for each one done', () => {
    const { progress, days } = history(busyDay(DAY));
    expect(monEarned(progress, [], assignmentsDone(progress, days)) - monEarned(progress, [])).toBe(3 * MON.assignment);
  });

  it(`earns a moon for ${MONTH_GOAL} in a month`, () => {
    const october = Array.from({ length: 10 }, (_, i) => busyDay(`2026-10-${String(i + 1).padStart(2, '0')}`)).flat();
    const { progress, days } = history(october);
    expect(monthChallenge(progress, days, '2026-10')).toEqual({ done: 30, goal: MONTH_GOAL });
    expect(moonsEarned(progress, days)).toBe(1);
    const nine = history(october.slice(0, 45));
    expect(moonsEarned(nine.progress, nine.days)).toBe(0);
  });
});
