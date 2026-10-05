// The word deck (src/content/vocab.json, built by scripts/build-vocab.mjs): the 2,500 most
// frequent Japanese words and the words GENKI I teaches, most frequent first.

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

// GENKI I's lessons, whose words are tagged in the deck: 0 is the greetings and numbers before
// lesson 1, then lessons 1 to 12.
export const GENKI_LESSONS = 12;
export type GenkiLesson = `genki-${number}`;

export function genkiLesson(lesson: number): GenkiLesson {
  return `genki-${lesson}`;
}

// The lesson number of a GENKI lesson's name, or null if it isn't one: genki-3 is 3.
export function genkiNumber(value: unknown): number | null {
  const m = typeof value === 'string' ? value.match(/^genki-(\d+)$/) : null;
  const lesson = m ? Number(m[1]) : null;
  return lesson !== null && lesson <= GENKI_LESSONS ? lesson : null;
}

// Where new words come from, besides the whole deck: a topic, the words the grammar lessons
// use, in lesson order, or a GENKI lesson's words.
export type NewWordsFrom = TopicId | 'grammar' | GenkiLesson;

export function isNewWordsFrom(value: unknown): value is NewWordsFrom {
  return value === 'grammar' || isTopic(value) || genkiNumber(value) !== null;
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
  genki: number | null; // the GENKI I lesson that teaches it (0 is before lesson 1), if one does
};

// Furigana's text without the readings: 食べる.
export function furiganaText(furigana: Furigana): string {
  return furigana.map((p) => p[0]).join('');
}

// Furigana read aloud, in kana: たべる.
export function furiganaReading(furigana: Furigana): string {
  return furigana.map((p) => p[1] ?? p[0]).join('');
}
