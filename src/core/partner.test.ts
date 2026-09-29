import { EMPTY_PROGRESS, type Completion, type Progress } from './answers';
import { kataId } from './kata';
import { MON, monEarned } from './mon';
import { choosePartner, completePartner, PARTNER_TARGETS, partnerGoal, partnerKind, partnerOn, partnersDone, type PartnerKind } from './partner';

const DAY = '2026-10-01';
const ME = 'me-0000';
const KENJI = 'kenji-000';
const NOTHING = { xp: 0, lessons: 0, kata: false };

// Progress with these records, all finished on `day` unless a record says otherwise.
function withRecords(records: (Completion & { day?: string })[], day = DAY) {
  const progress: Progress = { ...EMPTY_PROGRESS, completed: records.map(({ day: _, ...c }) => c) };
  return { progress, days: records.map((r) => r.day ?? day) };
}

// A pair whose goal on DAY is `kind`: found by trying friends until one fits.
function pairFor(kind: PartnerKind): string {
  for (let i = 0; i < 200; i++) if (partnerKind(DAY, ME, `friend-${i}`) === kind) return `friend-${i}`;
  throw new Error(`no pair gets ${kind}`);
}

describe('the shared goal', () => {
  it('is the same from both sides, so both see one goal', () => {
    for (let i = 0; i < 20; i++) expect(partnerKind(DAY, ME, `f${i}`)).toBe(partnerKind(DAY, `f${i}`, ME));
  });

  it('changes from day to day, and covers every kind', () => {
    const kinds = new Set(Array.from({ length: 30 }, (_, d) => partnerKind(`2026-10-${String(d + 1).padStart(2, '0')}`, ME, KENJI)));
    expect([...kinds].sort()).toEqual(['kata', 'lessons', 'xp']);
  });
});

describe('choosing a partner', () => {
  it('holds for the day: a second choice that day changes nothing', () => {
    const chosen = choosePartner(EMPTY_PROGRESS, DAY, KENJI, 100);
    expect(partnerOn(chosen, DAY)?.friend).toBe(KENJI);
    expect(choosePartner(chosen, DAY, 'yuki', 200)).toBe(chosen);
  });

  it('is new each day', () => {
    const chosen = choosePartner(EMPTY_PROGRESS, DAY, KENJI, 100);
    expect(partnerOn(chosen, '2026-10-02')).toBeNull();
    expect(partnerOn(choosePartner(chosen, '2026-10-02', 'yuki', 200), '2026-10-02')?.friend).toBe('yuki');
  });

  it("is the earliest choice, if two devices chose different friends that day", () => {
    const both: Progress = {
      ...EMPTY_PROGRESS,
      partners: [
        { day: DAY, friend: 'yuki', at: 300, done: false },
        { day: DAY, friend: KENJI, at: 100, done: false },
      ],
    };
    expect(partnerOn(both, DAY)?.friend).toBe(KENJI);
  });

  it('does not change the progress it was given', () => {
    const before = JSON.stringify(EMPTY_PROGRESS);
    choosePartner(EMPTY_PROGRESS, DAY, KENJI, 100);
    expect(JSON.stringify(EMPTY_PROGRESS)).toBe(before);
  });
});

describe('progress on the shared goal', () => {
  it('adds your XP from lessons today to theirs', () => {
    const friend = pairFor('xp');
    const { progress, days } = withRecords([
      { lesson: 'hiragana:a:0', at: 1, score: 120 },
      { lesson: 'hiragana:a:1', at: 2, score: 100 },
      { lesson: 'game:rain', at: 3, score: 900 }, // a game, not a lesson
      { lesson: 'hiragana:a:2', at: 4, score: 300, day: '2026-09-30' }, // yesterday
    ]);
    const goal = partnerGoal(progress, days, DAY, ME, friend, { xp: 150, lessons: 1, kata: false });
    expect(goal).toMatchObject({ kind: 'xp', mine: 220, theirs: 150, count: 370, target: PARTNER_TARGETS.xp, done: false });
  });

  it('is done once the two of you reach the target, and the count stops there', () => {
    const friend = pairFor('lessons');
    const { progress, days } = withRecords([1, 2, 3, 4].map((i) => ({ lesson: `hiragana:a:${i}`, at: i, score: 100 })));
    const goal = partnerGoal(progress, days, DAY, ME, friend, { xp: 0, lessons: 5, kata: false });
    expect(goal).toMatchObject({ kind: 'lessons', mine: 4, theirs: 5, count: PARTNER_TARGETS.lessons, done: true });
  });

  it('needs both of you for the kata', () => {
    const friend = pairFor('kata');
    const { progress, days } = withRecords([{ lesson: kataId(DAY), at: 1, score: 18 }]);
    expect(partnerGoal(progress, days, DAY, ME, friend, NOTHING)).toMatchObject({ count: 1, done: false });
    expect(partnerGoal(progress, days, DAY, ME, friend, { ...NOTHING, kata: true })).toMatchObject({ count: 2, done: true });
  });

  it('stays done once recorded, even when their day no longer counts', () => {
    const friend = pairFor('xp');
    const recorded = completePartner(choosePartner(EMPTY_PROGRESS, DAY, friend, 1), DAY, friend);
    expect(partnerGoal(recorded, [], DAY, ME, friend, NOTHING).done).toBe(true);
  });
});

describe('finishing together', () => {
  it('is recorded once, on the day it was chosen', () => {
    const chosen = choosePartner(EMPTY_PROGRESS, DAY, KENJI, 1);
    const done = completePartner(chosen, DAY, KENJI);
    expect(partnersDone(done)).toBe(1);
    expect(completePartner(done, DAY, KENJI)).toBe(done);
  });

  it('needs the partner to have been chosen', () => {
    expect(completePartner(EMPTY_PROGRESS, DAY, KENJI)).toBe(EMPTY_PROGRESS);
    const chosen = choosePartner(EMPTY_PROGRESS, DAY, KENJI, 1);
    expect(completePartner(chosen, DAY, 'yuki')).toBe(chosen);
  });

  it('earns mon, without counting as training', () => {
    const done = completePartner(choosePartner(EMPTY_PROGRESS, DAY, KENJI, 1), DAY, KENJI);
    expect(monEarned(done, [])).toBe(MON.partner);
    expect(done.completed).toEqual([]);
  });
});
