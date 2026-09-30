import { EMPTY_PROGRESS, completeLesson, type Progress } from './answers';
import { grammarId } from './grammar';
import { grammarDue, ratingFromScore, reviewExercises, reviewGrammar } from './grammar-review';
import { seededRng } from './random';
import { DAY_MS } from './srs';

const NOW = Date.UTC(2026, 9, 1, 9);
const LESSONS = ['desu', 'ka', 'no'];

describe('rating a grammar point from the answers', () => {
  it('is Good when all were right, Hard when most were, Again otherwise', () => {
    expect(ratingFromScore(3, 3)).toBe(3);
    expect(ratingFromScore(5, 5)).toBe(3);
    expect(ratingFromScore(2, 3)).toBe(2);
    expect(ratingFromScore(1, 3)).toBe(1);
    expect(ratingFromScore(0, 3)).toBe(1);
  });
});

describe('what grammar is due', () => {
  it('is nothing before any lesson is finished', () => {
    expect(grammarDue(EMPTY_PROGRESS, LESSONS, NOW)).toEqual([]);
  });

  it('is a finished lesson with no card yet (finished before reviews existed)', () => {
    const done = completeLesson(EMPTY_PROGRESS, grammarId('ka'), NOW - DAY_MS, 5);
    expect(grammarDue(done, LESSONS, NOW)).toEqual(['ka']);
  });

  it('is every card due by then, in lesson order, and not the ones due later', () => {
    let progress: Progress = EMPTY_PROGRESS;
    progress = reviewGrammar(progress, 'desu', 3, NOW - 10 * DAY_MS); // due a few days after
    progress = reviewGrammar(progress, 'no', 3, NOW); // due in 3 days
    expect(grammarDue(progress, LESSONS, NOW)).toEqual(['desu']);
    expect(grammarDue(progress, LESSONS, NOW + 5 * DAY_MS)).toEqual(['desu', 'no']);
  });
});

describe('reviewing a grammar point', () => {
  it('schedules it like a word, and grows the gap when it goes well', () => {
    const first = reviewGrammar(EMPTY_PROGRESS, 'desu', 3, NOW);
    const card = first.grammar.desu!;
    expect(card.due).toBe(NOW + 3 * DAY_MS);
    const second = reviewGrammar(first, 'desu', 3, card.due).grammar.desu!;
    expect(second.due - second.last).toBeGreaterThan(card.due - card.last);
  });

  it('does not change the progress it was given', () => {
    const before = JSON.stringify(EMPTY_PROGRESS);
    reviewGrammar(EMPTY_PROGRESS, 'desu', 1, NOW);
    expect(JSON.stringify(EMPTY_PROGRESS)).toBe(before);
  });
});

describe('the exercises for a review', () => {
  const exercises = ['a', 'b', 'c', 'd', 'e'];

  it('are three of the lesson’s, different ones, in a fresh order', () => {
    const picked = reviewExercises(exercises, seededRng('r'));
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const e of picked) expect(exercises).toContain(e);
  });

  it('are all of them when the lesson has fewer', () => {
    expect(reviewExercises(['a', 'b'], seededRng('r'))).toHaveLength(2);
  });
});
