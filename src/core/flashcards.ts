import type { Progress, WordFront } from './answers';
import { shuffle, type Rng } from './random';

// Flashcards, like Quizlet's: go through a deck, saying of each card whether you know it or are
// still learning it. Then go round again with the ones still being learned, and once you know
// them all, start the whole deck again. No schedule and no limit.

// A finished flashcard session is kept as a completed lesson with this id, counting as training
// for the streak, the daily goal and partners. (The id is from when words were reviewed on a
// schedule; sessions from then still count.)
export const WORDS_REVIEW_ID = 'words:review';

// Which side of a card shows first: the Japanese, or the English and picture.
export function setWordFront(progress: Progress, wordFront: WordFront): Progress {
  return { ...progress, settings: { ...progress.settings, wordFront } };
}

// Whether a card is known, as last said, and when.
export type FlashcardMark = { known: boolean; at: number };

export function markCard(progress: Progress, id: string, known: boolean, now: number): Progress {
  return { ...progress, flashcards: { ...progress.flashcards, [id]: { known, at: now } } };
}

// The cards of a deck last marked known, in the deck's order.
export function knownCards(progress: Progress, deck: readonly string[]): string[] {
  return deck.filter((id) => progress.flashcards[id]?.known === true);
}

// A round: its cards in the order they come, how far through, and what each answered card was.
export type FlashRound = {
  deck: readonly string[]; // every card, for starting again
  cards: readonly string[];
  at: number;
  known: readonly string[];
  learning: readonly string[];
};

function round(deck: readonly string[], cards: readonly string[], shuffled: boolean, rng: Rng): FlashRound {
  return { deck, cards: shuffled ? shuffle(cards, rng) : [...cards], at: 0, known: [], learning: [] };
}

export function startRound(deck: readonly string[], shuffled: boolean, rng: Rng): FlashRound {
  return round(deck, deck, shuffled, rng);
}

// The card showing, or null once the round is over.
export function currentCard(r: FlashRound): string | null {
  return r.cards[r.at] ?? null;
}

// The card after it, or null if it's the last (so the screen can draw it ahead of time).
export function nextCard(r: FlashRound): string | null {
  return r.cards[r.at + 1] ?? null;
}

export function roundOver(r: FlashRound): boolean {
  return r.at >= r.cards.length;
}

// Sorts the card showing into known or still learning, and moves on.
export function answerCard(r: FlashRound, know: boolean): FlashRound {
  const card = currentCard(r);
  if (card === null) return r;
  return {
    ...r,
    at: r.at + 1,
    known: know ? [...r.known, card] : r.known,
    learning: know ? r.learning : [...r.learning, card],
  };
}

// The next round: the cards still being learned, or if there are none, the whole deck again.
export function nextRound(r: FlashRound, shuffled: boolean, rng: Rng): FlashRound {
  return round(r.deck, r.learning.length > 0 ? r.learning : r.deck, shuffled, rng);
}
