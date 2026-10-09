import { useEffect, useState } from 'react';

import { speakWord } from '@/audio/pronounce';
import { genkiDeck, GENKI_DECKS } from '@/content/genki';
import { VOCAB } from '@/content/vocab';
import { completeLesson, type WordFront } from '@/core/answers';
import { answerCard, currentCard, knownCards, markCard, nextRound, roundOver, setWordFront, startRound, WORDS_REVIEW_ID } from '@/core/flashcards';
import type { VocabWord } from '@/core/vocab';

import { lessonById } from './use-grammar';
import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';

const BY_ID = new Map(VOCAB.map((w) => [String(w.id), w]));

export function wordById(id: string): VocabWord | null {
  return BY_ID.get(id) ?? null;
}

const ID_BY_WORD = new Map(VOCAB.map((w) => [w.word, String(w.id)]));

// A grammar lesson's words, by id, in the order the lesson lists them.
export function lessonWordIds(words: readonly string[]): string[] {
  return words.flatMap((w) => ID_BY_WORD.get(w) ?? []);
}

// A deck to study: a GENKI lesson's (genki-3), or a grammar lesson's words (grammar:<lesson id>).
export type Deck = { id: string; name: string; title: string; ids: readonly string[] };

export function deckById(id: string): Deck | null {
  if (id.startsWith('grammar:')) {
    const lesson = lessonById(id.slice('grammar:'.length));
    return lesson ? { id, name: 'Grammar lesson', title: lesson.title, ids: lessonWordIds(lesson.words) } : null;
  }
  return genkiDeck(id);
}

// The GENKI decks, with how many of each one's cards are known; and which side of a card shows
// first.
export function useDecks() {
  const { progress, updateProgress } = useProgress();
  return {
    decks: GENKI_DECKS.map((deck) => ({ ...deck, known: knownCards(progress, deck.ids).length })),
    front: progress.settings.wordFront,
    setFront: (front: WordFront) => updateProgress(setWordFront(progress, front)),
  };
}

// Studying a deck's flashcards (all of them, or `only` those still being learned): each card
// shows its front; tap to turn it over (and back), and say whether you know it. Then the next
// round goes over the ones still being learned, and once all are known, the whole deck again:
// as long as you like. Each answer is remembered on the card. Leaving keeps the session as
// training for the streak and the daily goal.
export function useFlashcards(deck: Deck, only: readonly string[] | null, shuffled: boolean) {
  const { progress, changeProgress } = useProgress();
  const haptics = useHaptics();
  const [round, setRound] = useState(() => startRound(only ?? deck.ids, shuffled, Math.random));
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const id = currentCard(round);
  const word = id ? wordById(id) : null;

  const sound = progress.settings.sound;
  const japaneseFront = progress.settings.wordFront === 'japanese';

  // A card with the Japanese in front says the word as it appears: hear it, and think what it
  // means. (Each answer, or a new round, brings a new card.)
  const reading = word?.reading;
  useEffect(() => {
    if (reading && japaneseFront && sound) speakWord(reading);
  }, [round, reading, japaneseFront, sound]);

  function flip() {
    if (!word) return;
    const next = !flipped;
    setFlipped(next);
    // English in front: turned over, hear the word. (Japanese in front, it was heard already.)
    if (next && !japaneseFront && sound) speakWord(word.reading);
  }

  function answer(know: boolean) {
    if (!id) return;
    changeProgress((p) => markCard(p, id, know, Date.now()));
    if (know) haptics.right();
    else haptics.miss();
    setAnswered(answered + 1);
    setRound(answerCard(round, know));
    setFlipped(false);
  }

  function again() {
    setRound(round.learning.length > 0 ? nextRound(round, shuffled, Math.random) : startRound(deck.ids, shuffled, Math.random));
    setFlipped(false);
  }

  // Keeps the session as training, once, if any cards were answered.
  function finish() {
    if (answered === 0 || recorded) return;
    setRecorded(true);
    changeProgress((p) => completeLesson(p, WORDS_REVIEW_ID, Date.now(), answered));
  }

  return {
    word,
    flipped,
    front: progress.settings.wordFront,
    // How far through this round.
    at: round.at,
    total: round.cards.length,
    over: roundOver(round),
    known: round.known.length,
    learning: round.learning.length,
    // Known across the whole deck, as last said.
    deckKnown: knownCards(progress, deck.ids).length,
    answered,
    flip,
    answer,
    again,
    finish,
    speak: () => word && speakWord(word.reading),
  };
}
