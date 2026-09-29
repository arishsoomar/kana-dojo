import { EMPTY_PROGRESS, type Progress } from './answers';
import { examId } from './exam';
import {
  linkNews,
  waitingRequests,
  type Link,
  formatFriendCode,
  FRIEND_CODE_LENGTH,
  friendSummary,
  friendToday,
  isFriendCode,
  isValidName,
  makeFriendCode,
  NAME_MAX,
  normalizeFriendCode,
  normalizeName,
  parseFriendSummary,
} from './friends';
import { KANA } from './kana';
import { kataId } from './kata';

const DAY = '2026-10-05';

describe('names', () => {
  it('are trimmed, with runs of spaces made single', () => {
    expect(normalizeName('  Kenji   the  Crow ')).toBe('Kenji the Crow');
  });

  it(`are 1 to ${NAME_MAX} characters`, () => {
    expect(isValidName('K')).toBe(true);
    expect(isValidName('x'.repeat(NAME_MAX))).toBe(true);
    expect(isValidName('x'.repeat(NAME_MAX + 1))).toBe(false);
    expect(isValidName('   ')).toBe(false);
  });

  it('can be in any script, but not hold control characters', () => {
    expect(isValidName('けんじ')).toBe(true);
    expect(isValidName('Ken\nji')).toBe(false);
  });
});

describe('friend codes', () => {
  it(`are ${FRIEND_CODE_LENGTH} characters, without look-alikes (I, O, 0, 1)`, () => {
    for (const value of [0, 0.4, 0.99]) {
      const code = makeFriendCode(() => value);
      expect(code).toMatch(new RegExp(`^[A-Z2-9]{${FRIEND_CODE_LENGTH}}$`));
      expect(code).not.toMatch(/[IO01]/);
    }
  });

  it('are shown in two halves, and read back however they were typed', () => {
    expect(formatFriendCode('7Q4MKX')).toBe('7Q4-MKX');
    expect(normalizeFriendCode(' 7q4-mkx ')).toBe('7Q4MKX');
    expect(isFriendCode('7q4 mkx')).toBe(true);
    expect(isFriendCode('7Q4MK')).toBe(false);
    expect(isFriendCode('7Q4MK0')).toBe(false);
  });
});

// A learner with the あ row green and an exam passed, a lesson and the kata today, one
// lesson yesterday, and a hat on.
function learner(): { progress: Progress; days: string[] } {
  const hiragana = KANA.filter((k) => k.script === 'hiragana' && k.row === 'a');
  const progress: Progress = {
    ...EMPTY_PROGRESS,
    kana: Object.fromEntries(hiragana.map((k) => [k.char, { box: 3, at: 1 }])),
    completed: [
      { lesson: 'hiragana:a:0', at: 1, score: 90 },
      { lesson: examId('hiragana', 'a', 'green'), at: 2, score: 19 },
      { lesson: 'hiragana:a:1', at: 3, score: 120 },
      { lesson: 'practice:hiragana', at: 4, score: 80 },
      { lesson: kataId(DAY), at: 5, score: 18, marks: 'f'.repeat(20), ms: 30_000 },
    ],
    settings: { ...EMPTY_PROGRESS.settings, gear: ['hachimaki'] },
  };
  return { progress, days: ['2026-10-04', '2026-10-04', DAY, DAY, DAY] };
}

describe('the summary friends see', () => {
  const { progress, days } = learner();
  const summary = friendSummary(progress, { days, today: DAY, streak: 2, moons: 1 });

  it("holds today's training, and the day it was for", () => {
    expect(summary).toMatchObject({ day: DAY, streak: 2, xpToday: 200, lessonsToday: 2, kataToday: true });
  });

  it('holds the rank, the gear and the dojo room', () => {
    expect(summary.rank).toBe('white');
    expect(summary.gear).toEqual(progress.settings.gear);
    expect(summary.room.plaques).toEqual([{ script: 'hiragana', row: 'a', kana: 'あいうえお', belt: 'green' }]);
    expect(summary.room.lanterns).toBe(1);
  });

  it('reads as nothing done today once its day has passed', () => {
    expect(friendToday(summary, DAY)).toEqual({ xp: 200, lessons: 2, kata: true });
    expect(friendToday(summary, '2026-10-06')).toEqual({ xp: 0, lessons: 0, kata: false });
  });

  it('survives being sent and read back', () => {
    expect(parseFriendSummary(JSON.parse(JSON.stringify(summary)))).toEqual(summary);
  });
});

describe("reading a friend's summary", () => {
  const { progress, days } = learner();
  const good = JSON.parse(JSON.stringify(friendSummary(progress, { days, today: DAY, streak: 2, moons: 1 })));

  it('rejects anything that is not a summary', () => {
    for (const bad of [null, 'hi', 3, [], {}, { ...good, rank: 'purple' }, { ...good, streak: -1 }, { ...good, day: 'soon' }]) {
      expect(parseFriendSummary(bad)).toBeNull();
    }
  });

  it('drops gear and plaques that are not real', () => {
    const odd = {
      ...good,
      gear: ['hachimaki', 'rocket-boots'],
      room: { ...good.room, plaques: [...good.room.plaques, { script: 'hiragana', row: 'zz', kana: 'x', belt: 'green' }] },
    };
    const read = parseFriendSummary(odd);
    expect(read?.gear).toEqual(['hachimaki']);
    expect(read?.room.plaques).toHaveLength(1);
  });

  it('cuts overlong text down to size', () => {
    const read = parseFriendSummary({ ...good, room: { ...good.room, scroll: { kana: ['き', 'さ'], name: 'x'.repeat(500) } } });
    expect(read?.room.scroll?.name.length).toBeLessThanOrEqual(40);
  });
});

describe('news about friends', () => {
  const kenji = (state: Link['state']): Link => ({ userId: 'k', name: 'Kenji', state });
  const yuki = (state: Link['state']): Link => ({ userId: 'y', name: 'Yuki', state });

  it('is a request when someone new asks', () => {
    expect(linkNews([], [kenji('incoming')])).toEqual([{ kind: 'request', userId: 'k', name: 'Kenji' }]);
  });

  it('is an acceptance when someone takes up your request', () => {
    expect(linkNews([kenji('outgoing')], [kenji('accepted')])).toEqual([{ kind: 'accepted', userId: 'k', name: 'Kenji' }]);
  });

  it('is nothing when you do it yourself: sending, or accepting theirs', () => {
    expect(linkNews([], [kenji('outgoing')])).toEqual([]);
    expect(linkNews([kenji('incoming')], [kenji('accepted')])).toEqual([]);
  });

  it('is nothing when nothing changed, or someone left', () => {
    expect(linkNews([kenji('accepted'), yuki('incoming')], [kenji('accepted'), yuki('incoming')])).toEqual([]);
    expect(linkNews([kenji('accepted')], [])).toEqual([]);
  });

  it('lists each piece of news, in the order of the new list', () => {
    expect(linkNews([yuki('outgoing')], [kenji('incoming'), yuki('accepted')]).map((n) => n.kind)).toEqual(['request', 'accepted']);
  });
});

describe('waiting requests', () => {
  it('counts the requests you have to answer, not the ones you sent', () => {
    const links: Link[] = [
      { userId: 'a', name: 'A', state: 'incoming' },
      { userId: 'b', name: 'B', state: 'incoming' },
      { userId: 'c', name: 'C', state: 'outgoing' },
      { userId: 'd', name: 'D', state: 'accepted' },
    ];
    expect(waitingRequests(links)).toBe(2);
    expect(waitingRequests([])).toBe(0);
  });
});
