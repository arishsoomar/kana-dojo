// Spaced repetition for the word deck: FSRS-5, the scheduler Anki uses, with its published
// default parameters (https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm).
//
// Each word has a stability (how many days until it's 90% likely to be remembered) and a
// difficulty (1 to 10). Each review updates both, from the rating and from how likely the
// word was to be remembered at that moment, and the word comes back when that likelihood
// falls to the target retention. A forgotten word comes back in ten minutes, in the same
// session. Everything works in timestamps; `now` is passed in.

export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export type WordCard = {
  stability: number; // days
  difficulty: number; // 1 (easy) to 10 (hard)
  due: number; // when it comes back
  last: number; // when it was last reviewed
  added: number; // when it was first studied
  reps: number;
  lapses: number; // times forgotten after being learned
};

export const FSRS_WEIGHTS = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698,
  0.2315, 2.9898, 0.51655, 0.6621,
] as const;

// The chance of remembering a word when it comes back: 90%, as Anki does by default.
export const RETENTION = 0.9;
export const DAY_MS = 86_400_000;
export const AGAIN_MS = 10 * 60_000;
const MAX_DAYS = 36_500;

const w = FSRS_WEIGHTS;
const DECAY = -0.5;
const FACTOR = 19 / 81; // so that retrievability is exactly 0.9 after `stability` days

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// The chance of remembering a word `elapsedDays` after its last review.
export function retrievability(elapsedDays: number, stability: number): number {
  return (1 + (FACTOR * Math.max(elapsedDays, 0)) / stability) ** DECAY;
}

// Days until retrievability falls to RETENTION.
function intervalDays(stability: number): number {
  return (stability / FACTOR) * (RETENTION ** (1 / DECAY) - 1);
}

function initialDifficulty(rating: Rating): number {
  return clamp(w[4] - Math.exp(w[5] * (rating - 1)) + 1, 1, 10);
}

function nextDifficulty(difficulty: number, rating: Rating): number {
  const change = -w[6] * (rating - 3);
  // Changes shrink near 10, so a hard word can still get easier; then a pull toward the
  // difficulty of a word rated Easy the first time.
  const moved = difficulty + (change * (10 - difficulty)) / 9;
  return clamp(w[7] * initialDifficulty(4) + (1 - w[7]) * moved, 1, 10);
}

function stabilityAfterRecall(card: WordCard, rating: Rating, r: number): number {
  const hard = rating === 2 ? w[15] : 1;
  const easy = rating === 4 ? w[16] : 1;
  const growth = Math.exp(w[8]) * (11 - card.difficulty) * card.stability ** -w[9] * (Math.exp(w[10] * (1 - r)) - 1) * hard * easy;
  return card.stability * (growth + 1);
}

function stabilityAfterForgetting(card: WordCard, r: number): number {
  const s = w[11] * card.difficulty ** -w[12] * ((card.stability + 1) ** w[13] - 1) * Math.exp(w[14] * (1 - r));
  return Math.min(s, card.stability);
}

// Seen again within a day (after forgetting it earlier in the session, say).
function stabilitySameDay(card: WordCard, rating: Rating): number {
  return card.stability * Math.exp(w[17] * (rating - 3 + w[18]));
}

// What each rating would do: the card's new stability and difficulty. `card` is null for a
// word being studied for the first time.
function outcome(card: WordCard | null, rating: Rating, now: number): { stability: number; difficulty: number } {
  if (!card) return { stability: w[rating - 1]!, difficulty: initialDifficulty(rating) };
  const elapsed = (now - card.last) / DAY_MS;
  const difficulty = nextDifficulty(card.difficulty, rating);
  if (elapsed < 1) return { stability: stabilitySameDay(card, rating), difficulty };
  const r = retrievability(elapsed, card.stability);
  return { stability: rating === 1 ? stabilityAfterForgetting(card, r) : stabilityAfterRecall(card, rating, r), difficulty };
}

// How long until the word comes back, for each rating, in milliseconds. Whole days, except
// Again (ten minutes); and always Hard < Good < Easy, a day apart at least.
export function nextIntervals(card: WordCard | null, now: number): Record<Rating, number> {
  const days = (rating: Rating) => clamp(Math.round(intervalDays(outcome(card, rating, now).stability)), 1, MAX_DAYS);
  const hard = days(2);
  const good = Math.max(days(3), hard + 1);
  const easy = Math.max(days(4), good + 1);
  return { 1: AGAIN_MS, 2: hard * DAY_MS, 3: good * DAY_MS, 4: easy * DAY_MS };
}

// The card after a review.
export function review(card: WordCard | null, rating: Rating, now: number): WordCard {
  const { stability, difficulty } = outcome(card, rating, now);
  return {
    stability,
    difficulty,
    due: now + nextIntervals(card, now)[rating],
    last: now,
    added: card?.added ?? now,
    reps: (card?.reps ?? 0) + 1,
    // A lapse is forgetting a word that had been learned, not missing a new one.
    lapses: (card?.lapses ?? 0) + (rating === 1 && card !== null && card.reps > 0 ? 1 : 0),
  };
}

// "10m", "1d", "4d", "1.5mo", "1.1y": how long until a word comes back, for the buttons.
export function intervalLabel(ms: number): string {
  if (ms < DAY_MS) return `${Math.round(ms / 60_000)}m`;
  const days = ms / DAY_MS;
  if (days < 30) return `${Math.round(days)}d`;
  const trim = (n: number) => String(Math.round(n * 10) / 10);
  if (days < 365) return `${trim(days / 30)}mo`;
  return `${trim(days / 365)}y`;
}
