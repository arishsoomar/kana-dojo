// The word deck (src/content/vocab.json, built by scripts/build-vocab.mjs): the 2,500 most
// frequent Japanese words, most frequent first.

// Text with its furigana, in pieces: kanji with the reading over them, and plain kana with
// none. 食べる is [['食', 'た'], ['べる']].
export type FuriganaPiece = readonly [text: string] | readonly [text: string, reading: string];
export type Furigana = readonly FuriganaPiece[];

// Topics to browse and study by (names in src/content/topics.ts). A word can be in several,
// or none.
export const TOPIC_IDS = ['food', 'places', 'people', 'time', 'body', 'feelings', 'nature', 'animals', 'home', 'work', 'numbers', 'talk'] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export function isTopic(value: unknown): value is TopicId {
  return typeof value === 'string' && (TOPIC_IDS as readonly string[]).includes(value);
}

// Where new words come from, besides the whole deck: a topic, or the words the grammar lessons
// use, in lesson order.
export type NewWordsFrom = TopicId | 'grammar';

export function isNewWordsFrom(value: unknown): value is NewWordsFrom {
  return value === 'grammar' || isTopic(value);
}

export type VocabWord = {
  id: number; // its JMdict entry number
  rank: number; // where it comes in the frequency list
  word: string; // as it's usually written
  reading: string; // in kana
  furigana: Furigana;
  meanings: readonly string[]; // one per sense, most common first
  pos: readonly string[]; // JMdict's parts of speech, like "v1" (a る-verb) or "adj-i"
  example: { ja: Furigana; en: string } | null;
  topics: readonly TopicId[];
};

// Furigana's text without the readings: 食べる.
export function furiganaText(furigana: Furigana): string {
  return furigana.map((p) => p[0]).join('');
}

// Furigana read aloud, in kana: たべる.
export function furiganaReading(furigana: Furigana): string {
  return furigana.map((p) => p[1] ?? p[0]).join('');
}
