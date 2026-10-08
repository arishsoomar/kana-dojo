import { NEW_WORDS, type Progress, type WordFront } from './answers';
import { review, type Rating } from './srs';
import type { NewWordsFrom } from './vocab';

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

// Which side of a word card shows first: the Japanese, or the English and picture.
export function setWordFront(progress: Progress, wordFront: WordFront): Progress {
  return { ...progress, settings: { ...progress.settings, wordFront } };
}

// New words only from one topic (food, say) or the grammar lessons' words, or from any.
export function setNewWordsTopic(progress: Progress, topic: NewWordsFrom | null): Progress {
  return { ...progress, settings: { ...progress.settings, newWordsTopic: topic } };
}

// The words of a list not started yet, in the list's order: a lesson's words still to learn.
export function notStarted(progress: Progress, list: readonly string[]): string[] {
  return list.filter((id) => progress.words[id] === undefined);
}

// More new words than the day's number, when asked for: the next ones not started.
export function extraNewWords(progress: Progress, deck: readonly string[], count: number): string[] {
  return notStarted(progress, deck).slice(0, count);
}

// Words to practise, outside the schedule: those studied since `dayStart` (today), or if none,
// since `weekStart`. The most recently studied first.
export function wordsToPractice(progress: Progress, dayStart: number, weekStart: number): string[] {
  const since = (start: number) =>
    Object.entries(progress.words)
      .filter(([, card]) => card.last >= start)
      .sort(([, a], [, b]) => b.last - a.last)
      .map(([id]) => id);
  const today = since(dayStart);
  return today.length > 0 ? today : since(weekStart);
}

// Words of a list (a topic, a GENKI lesson) to practise, outside the schedule: those started,
// the soonest due first, so the ones nearest to being forgotten come first. Up to `count`.
export function wordsToPracticeFrom(progress: Progress, list: readonly string[], count: number): string[] {
  return list
    .flatMap((id) => {
      const card = progress.words[id];
      return card ? [{ id, due: card.due }] : [];
    })
    .sort((a, b) => a.due - b.due)
    .slice(0, count)
    .map(({ id }) => id);
}
