// The word deck (src/content/vocab.json, built by scripts/build-vocab.mjs): the 2,500 most
// frequent Japanese words and the words GENKI I teaches, most frequent first.

// Text with its furigana, in pieces: kanji with the reading over them, and plain kana with
// none. 食べる is [['食', 'た'], ['べる']].
export type FuriganaPiece = readonly [text: string] | readonly [text: string, reading: string];
export type Furigana = readonly FuriganaPiece[];

// Topics each word is tagged with when the deck is built (scripts/build-vocab.mjs). A word can
// be in several, or none. Not shown in the app for now.
export const TOPIC_IDS = ['food', 'places', 'people', 'time', 'body', 'feelings', 'nature', 'animals', 'home', 'work', 'numbers', 'talk'] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export function isTopic(value: unknown): value is TopicId {
  return typeof value === 'string' && (TOPIC_IDS as readonly string[]).includes(value);
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
  labels: readonly string[]; // who says it and how, as JMdict's codes: "hon", "hum", "male"…
  note: string | null; // a usage note, like "informal, rough, blunt"
};

// Furigana's text without the readings: 食べる.
export function furiganaText(furigana: Furigana): string {
  return furigana.map((p) => p[0]).join('');
}

// Furigana read aloud, in kana: たべる.
export function furiganaReading(furigana: Furigana): string {
  return furigana.map((p) => p[1] ?? p[0]).join('');
}
