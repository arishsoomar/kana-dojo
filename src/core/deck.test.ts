import { EMPTY_PROGRESS, NEW_WORDS, type Progress } from './answers';
import { dueWords, extraNewWords, newWordsLeft, notStarted, wordsToPractice, rateWord, setNewWords, setNewWordsTopic, studySession, wordsStudied } from './deck';
import { DAY_MS, review } from './srs';

const DECK = ['a', 'b', 'c', 'd', 'e', 'f'];
const TODAY = Date.UTC(2026, 9, 1); // midnight, the start of today
const NOW = TODAY + 9 * 3_600_000;
const TONIGHT = TODAY + DAY_MS;

// Progress with some words studied: `a` due yesterday, `b` due tonight, `c` due next week.
const studied: Progress = {
  ...EMPTY_PROGRESS,
  words: {
    a: { ...review(null, 3, TODAY - 10 * DAY_MS), due: TODAY - DAY_MS },
    b: { ...review(null, 3, TODAY - 5 * DAY_MS), due: TODAY + 20 * 3_600_000 },
    c: { ...review(null, 3, TODAY - 2 * DAY_MS), due: TODAY + 7 * DAY_MS },
  },
};

describe('what is due', () => {
  it('is every studied word due by then, the longest-waiting first', () => {
    expect(dueWords(studied, TONIGHT)).toEqual(['a', 'b']);
    expect(dueWords(studied, NOW)).toEqual(['a']);
  });
});

describe('new words', () => {
  it(`starts at ${NEW_WORDS.default} a day, less the ones started today`, () => {
    expect(newWordsLeft(EMPTY_PROGRESS, TODAY)).toBe(NEW_WORDS.default);
    const startedTwo = rateWord(rateWord(EMPTY_PROGRESS, 'a', 3, NOW), 'b', 1, NOW);
    expect(newWordsLeft(startedTwo, TODAY)).toBe(NEW_WORDS.default - 2);
    expect(newWordsLeft(startedTwo, TODAY + DAY_MS)).toBe(NEW_WORDS.default);
  });

  it('can be changed, within its range', () => {
    expect(setNewWords(EMPTY_PROGRESS, 20).settings.newWords).toBe(20);
    expect(setNewWords(EMPTY_PROGRESS, 500).settings.newWords).toBe(NEW_WORDS.max);
    expect(setNewWords(EMPTY_PROGRESS, 0).settings.newWords).toBe(NEW_WORDS.min);
  });
});

describe('new words from a topic', () => {
  it('is a choice that can be set, and cleared back to any topic', () => {
    const food = setNewWordsTopic(EMPTY_PROGRESS, 'food');
    expect(food.settings.newWordsTopic).toBe('food');
    expect(setNewWordsTopic(food, 'grammar').settings.newWordsTopic).toBe('grammar');
    expect(setNewWordsTopic(food, null).settings.newWordsTopic).toBeNull();
  });
});

describe('words not started', () => {
  it('are the ones in a list with no card yet, in the list order', () => {
    expect(notStarted(studied, ['c', 'd', 'a', 'e'])).toEqual(['d', 'e']);
    expect(notStarted(EMPTY_PROGRESS, [])).toEqual([]);
  });
});

describe("today's session", () => {
  it('reviews what is due first, then the next new words in deck order', () => {
    const small = setNewWords(studied, 2);
    expect(studySession(small, DECK, TODAY, TONIGHT)).toEqual({ due: ['a', 'b'], fresh: ['d', 'e'] });
  });

  it('has no new words once the day has had its share', () => {
    let today = setNewWords(EMPTY_PROGRESS, 2);
    today = rateWord(rateWord(today, 'a', 3, NOW), 'b', 3, NOW);
    expect(studySession(today, DECK, TODAY, TONIGHT).fresh).toEqual([]);
  });
});

describe('rating a word', () => {
  it('schedules it, and counts it as studied', () => {
    const next = rateWord(EMPTY_PROGRESS, 'a', 3, NOW);
    expect(next.words.a).toEqual(review(null, 3, NOW));
    expect(wordsStudied(next)).toBe(1);
  });

  it('does not change the progress it was given', () => {
    const before = JSON.stringify(studied);
    rateWord(studied, 'a', 1, NOW);
    expect(JSON.stringify(studied)).toBe(before);
  });
});

describe('practice', () => {
  it("is the words studied today, the most recent first", () => {
    let p = rateWord(EMPTY_PROGRESS, 'a', 3, NOW - 2 * DAY_MS);
    p = rateWord(p, 'b', 3, NOW);
    p = rateWord(p, 'c', 1, NOW + 60_000);
    expect(wordsToPractice(p, TODAY, TODAY - 7 * DAY_MS)).toEqual(['c', 'b']);
  });

  it('is the words of the last week when none were studied today', () => {
    let p = rateWord(EMPTY_PROGRESS, 'a', 3, TODAY - 2 * DAY_MS);
    p = rateWord(p, 'b', 3, TODAY - 10 * DAY_MS);
    expect(wordsToPractice(p, TODAY, TODAY - 7 * DAY_MS)).toEqual(['a']);
    expect(wordsToPractice(EMPTY_PROGRESS, TODAY, TODAY - 7 * DAY_MS)).toEqual([]);
  });
});

describe('learning more today', () => {
  it('is the next new words, past the daily number', () => {
    let p = setNewWords(EMPTY_PROGRESS, 2);
    p = rateWord(rateWord(p, 'a', 3, NOW), 'b', 3, NOW);
    expect(studySession(p, DECK, TODAY, TONIGHT).fresh).toEqual([]);
    expect(extraNewWords(p, DECK, 3)).toEqual(['c', 'd', 'e']);
  });
});
