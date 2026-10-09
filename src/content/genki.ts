import data from './genki.json';

// The flashcard decks: one per lesson of GENKI I (3rd edition), its words in the order the
// lesson lists them (src/content/genki.json, written by scripts/build-vocab.mjs from
// scripts/genki-words.mjs). Lesson 0 is the greetings and numbers before lesson 1.

export type GenkiDeck = { id: string; lesson: number; name: string; title: string; ids: readonly string[] };

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

const LESSONS: Readonly<Record<string, readonly number[]>> = data;

export const GENKI_DECKS: readonly GenkiDeck[] = TITLES.map((title, lesson) => ({
  id: `genki-${lesson}`,
  lesson,
  name: lesson === 0 ? 'Before lesson 1' : `Lesson ${lesson}`,
  title,
  ids: (LESSONS[String(lesson)] ?? []).map(String),
}));

export function genkiDeck(id: string): GenkiDeck | null {
  return GENKI_DECKS.find((d) => d.id === id) ?? null;
}
