import { NEW_WORDS, type Progress } from './answers';
import { review, type Rating } from './srs';
import type { TopicId } from './vocab';

// The word deck, day to day: what's due, how many new words today can start, and rating a
// word. Words are kept by id (a string); the deck's order comes from outside, most frequent
// first. Days are passed in as timestamps: `dayStart` is today's local midnight.

// A session of word reviews, as it's kept in finished lessons: its score is the cards reviewed.
export const WORDS_REVIEW_ID = 'words:review';

// Studied words due by `until`, the one that has waited longest first.
export function dueWords(progress: Progress, until: number): string[] {
  return Object.entries(progress.words)
    .filter(([, card]) => card.due <= until)
    .sort(([, a], [, b]) => a.due - b.due)
    .map(([id]) => id);
}

// New words today can still start: the daily number, less those first studied today.
export function newWordsLeft(progress: Progress, dayStart: number): number {
  const startedToday = Object.values(progress.words).filter((card) => card.added >= dayStart).length;
  return Math.max(progress.settings.newWords - startedToday, 0);
}

export type Session = {
  due: string[]; // words to review, first
  fresh: string[]; // then new words, in deck order
};

// Today's study: everything due by `until` (usually tonight), then today's new words.
export function studySession(progress: Progress, deck: readonly string[], dayStart: number, until: number): Session {
  const fresh = deck.filter((id) => progress.words[id] === undefined).slice(0, newWordsLeft(progress, dayStart));
  return { due: dueWords(progress, until), fresh };
}

export function rateWord(progress: Progress, id: string, rating: Rating, now: number): Progress {
  return { ...progress, words: { ...progress.words, [id]: review(progress.words[id] ?? null, rating, now) } };
}

// Words studied at least once.
export function wordsStudied(progress: Progress): number {
  return Object.keys(progress.words).length;
}

export function setNewWords(progress: Progress, perDay: number): Progress {
  const newWords = Math.min(Math.max(Math.round(perDay), NEW_WORDS.min), NEW_WORDS.max);
  return { ...progress, settings: { ...progress.settings, newWords } };
}

// New words only from one topic (food, say), or from any.
export function setNewWordsTopic(progress: Progress, topic: TopicId | null): Progress {
  return { ...progress, settings: { ...progress.settings, newWordsTopic: topic } };
}
