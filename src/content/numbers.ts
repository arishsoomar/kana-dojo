import { BIG_NUMBERS, NUMBER_SETS, numberWord } from '@/core/numbers';
import type { VocabWord } from '@/core/vocab';

// The number decks: 1 to 10, 11 to 20… 91 to 100, and all 100; then GENKI's big numbers, the
// hundreds, thousands and ten thousands, and all of those. A number is one card wherever it
// comes, so knowing 21 in 21 to 30 is knowing it in all 100 too, and 100 is in the hundreds.

export type NumberDeck = { id: string; name: string; title: string; ids: readonly string[] };

const cardId = (n: number) => `number:${n}`;

export const NUMBER_DECKS: readonly NumberDeck[] = NUMBER_SETS.map(({ name, title, numbers }) => ({
  id: `numbers-${numbers[0]}-${numbers.at(-1)}`,
  name,
  title,
  ids: numbers.map(cardId),
}));

export function numberDeck(id: string): NumberDeck | null {
  return NUMBER_DECKS.find((d) => d.id === id) ?? null;
}

const NUMBERS = [...new Set([...Array.from({ length: 100 }, (_, i) => i + 1), ...BIG_NUMBERS])];
const CARDS = new Map(NUMBERS.map((n) => [cardId(n), numberWord(n)]));

export function numberCard(id: string): VocabWord | null {
  return CARDS.get(id) ?? null;
}

// Every number: 1 to 100 and the big ones.
export const NUMBER_CARDS: readonly VocabWord[] = [...CARDS.values()];
