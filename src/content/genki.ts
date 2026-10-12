import type { Furigana, VocabWord } from '@/core/vocab';

import data from './genki.json';
import { VOCAB } from './vocab';

// The flashcard decks: one per lesson of GENKI I (3rd edition), each card a word from the
// lesson's vocabulary list as the book has it, with the book's English, in the book's order
// (src/content/genki.json, written by scripts/build-vocab.mjs from scripts/genki-words.mjs).
// Lesson 0 is the greetings and numbers before lesson 1. A card linked to a word in the word
// deck (`vocab`) brings that word's example sentence, usage labels and the like.

export type GenkiDeck = { id: string; lesson: number; name: string; title: string; ids: readonly string[] };

type GenkiCard = { id: string; word: string; reading: string; furigana: Furigana; meaning: string; vocab: number | null };

const TITLES = [
  'Greetings and numbers',
  'New Friends',
  'Shopping',
  'Making a Date',
  'The First Date',
  'A Trip to Okinawa',
  "A Day in Robert's Life",
  'Family Picture',
  'Barbecue',
  'Kabuki',
  'Winter Vacation Plans',
  'After the Vacation',
  'Feeling Ill',
] as const;

// JSON's types are too loose for furigana pieces (a plain string array to TypeScript), hence the
// cast; genki.test.ts checks every card has this shape.
const LESSONS = data as unknown as Readonly<Record<string, readonly GenkiCard[]>>;

export const GENKI_DECKS: readonly GenkiDeck[] = TITLES.map((title, lesson) => ({
  id: `genki-${lesson}`,
  lesson,
  name: lesson === 0 ? 'Before lesson 1' : `Lesson ${lesson}`,
  title,
  ids: (LESSONS[String(lesson)] ?? []).map((c) => c.id),
}));

export function genkiDeck(id: string): GenkiDeck | null {
  return GENKI_DECKS.find((d) => d.id === id) ?? null;
}

const BY_VOCAB_ID = new Map(VOCAB.map((w) => [w.id, w]));

// Each card as a word to show: the book's word, reading and English, and from the linked word
// its example sentence, usage labels and note.
const CARDS = new Map<string, VocabWord>(
  Object.values(LESSONS)
    .flat()
    .map((card) => {
      const linked = card.vocab === null ? undefined : BY_VOCAB_ID.get(card.vocab);
      const word: VocabWord = {
        id: card.vocab ?? 0,
        rank: linked?.rank ?? 0,
        word: card.word,
        reading: card.reading,
        furigana: card.furigana,
        meanings: [card.meaning],
        pos: linked?.pos ?? [],
        example: linked?.example ?? null,
        topics: linked?.topics ?? [],
        labels: linked?.labels ?? [],
        note: linked?.note ?? null,
      };
      return [card.id, word];
    }),
);

export function genkiCard(id: string): VocabWord | null {
  return CARDS.get(id) ?? null;
}

// Every card, once each (a card in two lessons is one card).
export const GENKI_CARDS: readonly VocabWord[] = [...CARDS.values()];
