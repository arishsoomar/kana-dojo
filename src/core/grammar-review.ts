import type { Progress } from './answers';
import { grammarId } from './grammar';
import { shuffle, type Rng } from './random';
import { review, type Rating } from './srs';

// Reviewing grammar by spaced repetition, like the word deck: each grammar point (a lesson)
// has a card, scheduled by FSRS. A review asks a few of the lesson's exercises; how they went
// is the rating, since there's no card to turn over and judge. A lesson's card starts when
// it's finished.

// Exercises asked in a review of one grammar point.
export const REVIEW_EXERCISES = 3;

// A session of grammar reviews, as it's kept in finished lessons: its score is the points
// reviewed.
export const GRAMMAR_REVIEW_ID = 'grammar-review';

// The rating from the answers: all right is Good, most right is Hard, otherwise Again.
export function ratingFromScore(right: number, total: number): Rating {
  if (right >= total) return 3;
  if (right * 2 > total) return 2;
  return 1;
}

// Grammar points due by `until`, in lesson order: every card due, and every lesson finished
// without a card yet (finished before reviews existed), which is due now.
export function grammarDue(progress: Progress, lessonIds: readonly string[], until: number): string[] {
  return lessonIds.filter((id) => {
    const card = progress.grammar[id];
    if (card) return card.due <= until;
    return progress.completed.some((c) => c.lesson === grammarId(id));
  });
}

export function reviewGrammar(progress: Progress, lessonId: string, rating: Rating, now: number): Progress {
  return { ...progress, grammar: { ...progress.grammar, [lessonId]: review(progress.grammar[lessonId] ?? null, rating, now) } };
}

// A few of a lesson's exercises, in a fresh order.
export function reviewExercises<T>(exercises: readonly T[], rng: Rng): T[] {
  return shuffle(exercises, rng).slice(0, REVIEW_EXERCISES);
}
