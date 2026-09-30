import { AGAIN_MS, DAY_MS, FSRS_WEIGHTS, intervalLabel, nextIntervals, retrievability, review, type Rating, type WordCard } from './srs';

const NOW = Date.UTC(2026, 9, 1, 9);
const AGAIN: Rating = 1;
const HARD: Rating = 2;
const GOOD: Rating = 3;
const EASY: Rating = 4;
const days = (ms: number) => ms / DAY_MS;

// A card reviewed Good every time it comes due, `times` times.
function goodEveryTime(times: number): WordCard[] {
  const cards: WordCard[] = [];
  let card = review(null, GOOD, NOW);
  cards.push(card);
  for (let i = 1; i < times; i++) {
    card = review(card, GOOD, card.due);
    cards.push(card);
  }
  return cards;
}

describe('how well a word is remembered', () => {
  it('is certain straight after a review, 90% after its stability in days, and falls from there', () => {
    expect(retrievability(0, 5)).toBeCloseTo(1);
    expect(retrievability(5, 5)).toBeCloseTo(0.9);
    expect(retrievability(20, 5)).toBeLessThan(retrievability(10, 5));
  });
});

describe('a new word', () => {
  it("starts from FSRS's first-review stabilities", () => {
    expect(review(null, GOOD, NOW).stability).toBeCloseTo(FSRS_WEIGHTS[2]);
    expect(review(null, EASY, NOW).stability).toBeCloseTo(FSRS_WEIGHTS[3]);
  });

  it('comes back in 10 minutes if forgotten, in a day or so if hard, 3 days if good, over two weeks if easy', () => {
    const next = nextIntervals(null, NOW);
    expect(next[AGAIN]).toBe(AGAIN_MS);
    expect(days(next[HARD])).toBe(1);
    expect(days(next[GOOD])).toBe(3);
    expect(days(next[EASY])).toBeGreaterThanOrEqual(15);
  });

  it('counts its first review, and when it was added', () => {
    const card = review(null, GOOD, NOW);
    expect(card).toMatchObject({ reps: 1, lapses: 0, added: NOW, last: NOW, due: NOW + 3 * DAY_MS });
  });
});

describe('reviewing a word', () => {
  it('waits longer each time it is remembered', () => {
    const gaps = goodEveryTime(6).map((c) => c.due - c.last);
    gaps.slice(1).forEach((gap, i) => expect(gap).toBeGreaterThan(gaps[i]!));
    expect(days(gaps[5]!)).toBeGreaterThan(30);
  });

  it('always offers again < hard < good < easy', () => {
    for (const card of [null, ...goodEveryTime(5)]) {
      const at = card?.due ?? NOW;
      const next = nextIntervals(card, at);
      expect(next[AGAIN]).toBeLessThan(next[HARD]);
      expect(next[HARD]).toBeLessThan(next[GOOD]);
      expect(next[GOOD]).toBeLessThan(next[EASY]);
    }
  });

  it('forgetting a known word counts a lapse, cuts its stability, and brings it back in 10 minutes', () => {
    const known = goodEveryTime(4).at(-1)!;
    const forgot = review(known, AGAIN, known.due);
    expect(forgot.lapses).toBe(1);
    expect(forgot.stability).toBeLessThan(known.stability);
    expect(forgot.due).toBe(known.due + AGAIN_MS);
  });

  it('makes a word harder when forgotten and easier when easy, always between 1 and 10', () => {
    const card = review(null, GOOD, NOW);
    expect(review(card, AGAIN, card.due).difficulty).toBeGreaterThan(card.difficulty);
    expect(review(card, EASY, card.due).difficulty).toBeLessThan(card.difficulty);
    let hard = card;
    for (let i = 0; i < 20; i++) hard = review(hard, AGAIN, hard.due);
    let easy = card;
    for (let i = 0; i < 20; i++) easy = review(easy, EASY, easy.due);
    expect(hard.difficulty).toBeLessThanOrEqual(10);
    expect(easy.difficulty).toBeGreaterThanOrEqual(1);
  });

  it('grows less from a review before it was due than from one on time', () => {
    const card = goodEveryTime(3).at(-1)!;
    const early = review(card, GOOD, card.last + (card.due - card.last) / 4);
    const onTime = review(card, GOOD, card.due);
    expect(early.stability).toBeLessThan(onTime.stability);
  });

  it('grows gently when seen again the same day (after forgetting it, say)', () => {
    const card = goodEveryTime(3).at(-1)!;
    const forgot = review(card, AGAIN, card.due);
    const again = review(forgot, GOOD, forgot.due);
    expect(again.stability).toBeGreaterThan(forgot.stability);
    expect(again.stability).toBeLessThan(forgot.stability * 2);
  });

  it('does not change the card it was given', () => {
    const card = review(null, GOOD, NOW);
    const before = JSON.stringify(card);
    review(card, AGAIN, card.due);
    expect(JSON.stringify(card)).toBe(before);
  });
});

describe('saying when a word comes back', () => {
  it('uses minutes, days, months and years', () => {
    expect(intervalLabel(AGAIN_MS)).toBe('10m');
    expect(intervalLabel(DAY_MS)).toBe('1d');
    expect(intervalLabel(4 * DAY_MS)).toBe('4d');
    expect(intervalLabel(45 * DAY_MS)).toBe('1.5mo');
    expect(intervalLabel(400 * DAY_MS)).toBe('1.1y');
  });
});
