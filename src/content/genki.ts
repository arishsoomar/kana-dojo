import { DEFAULT_NAME, parseRuby, rubyText, sayJapanese } from '@/core/grammar';
import { furiganaText, type Furigana, type VocabWord } from '@/core/vocab';

import data from './genki.json';
import { GRAMMAR_LESSONS } from './grammar';
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

// The lesson each card is first taught in.
const FIRST_LESSON = new Map<string, number>();
for (const [lesson, cards] of Object.entries(LESSONS)) for (const c of cards) if (!FIRST_LESSON.has(c.id)) FIRST_LESSON.set(c.id, Number(lesson));

// Every kanji word and reading the decks have taught by a lesson, as base|reading, and any run
// of them in a word: 大学生 teaches 大学, 学生 and 大学生, each with its reading. 来る's other
// readings in its conjugations count too: 来ます (き), 来ない (こ).
export function taughtBy(lesson: number): Set<string> {
  const taught = new Set<string>(['来|き', '来|こ']);
  for (const [l, cards] of Object.entries(LESSONS)) {
    if (Number(l) > lesson) continue;
    for (const { furigana: pieces } of cards) {
      for (let from = 0; from < pieces.length; from++) {
        let base = '';
        let reading = '';
        for (let to = from; to < pieces.length && pieces[to]![1] !== undefined; to++) {
          base += pieces[to]![0];
          reading += pieces[to]![1];
          taught.add(`${base}|${reading}`);
        }
      }
    }
  }
  return taught;
}

const TAUGHT = new Map(Array.from({ length: TITLES.length }, (_, lesson) => [lesson, taughtBy(lesson)]));

// Whether a card's word is a sentence's word (a token, its words spaced): the word itself, a
// noun with a particle-like ending (静かな, 一緒に), a verb or い-adjective by its stem (食べ for
// 食べる, 食べます), or a する verb by its noun with し/す/さ after (勉強 します).
function usesWord(tokens: readonly string[], word: string, pos: readonly string[]): boolean {
  // Verbs (v1, v5…, vk, vz) and い-adjectives; not nouns that can take する (vs).
  const conjugates = pos.some((p) => /^v(1|5|k|z|s-i|s-s)/.test(p) || p === 'adj-i');
  const suru = word.length > 2 && word.endsWith('する') ? word.slice(0, -2) : null;
  const stem = conjugates && !suru ? word.slice(0, -1) : null;
  return tokens.some((token, i) => {
    const next = tokens[i + 1] ?? '';
    if (suru) return token === suru && /^[しすさ]/.test(next);
    if (stem && stem.length >= 2 && token.startsWith(stem)) return true;
    return token === word || token + next === word || /^(な|に|で|の|だ)$/.test(token.slice(word.length)) && token.startsWith(word);
  });
}

// The grammar lessons' sentences to say, by lesson, with their words spaced (no name in them).
const SENTENCES = new Map(
  GRAMMAR_LESSONS.map((l) => [
    l.lesson,
    l.points.flatMap((p) =>
      p.say
        .filter((card) => !card.ja.includes('{name}'))
        .map((card) => ({ card, tokens: card.ja.split(' ').map((t) => rubyText(t).replace(/[。、？！…]+$/, '')) })),
    ),
  ]),
);

// A card's example sentence: one of the grammar lessons' that uses the word, from its lesson or
// the nearest before it (words and grammar you know), or failing that a later one; or else the
// dictionary's, if it's short and every kanji word in it is taught by then; or none.
function exampleFor(card: GenkiCard, pos: readonly string[], dictionary: VocabWord['example']): VocabWord['example'] {
  const lesson = FIRST_LESSON.get(card.id) ?? 0;
  const word = card.word.replace(/[～〜]/g, '');
  if (word && word === card.word) {
    const order = [...GRAMMAR_LESSONS.map((l) => l.lesson).filter((l) => l <= lesson).reverse(), ...GRAMMAR_LESSONS.map((l) => l.lesson).filter((l) => l > lesson)];
    for (const l of order) {
      const found = SENTENCES.get(l)?.find((s) => usesWord(s.tokens, word, pos));
      if (found) return { ja: parseRuby(sayJapanese(found.card.ja, DEFAULT_NAME)), en: found.card.en };
    }
  }
  if (!dictionary) return null;
  const taught = TAUGHT.get(lesson)!;
  const easy = furiganaText(dictionary.ja).length <= 16 && dictionary.ja.every((p) => p[1] === undefined || taught.has(`${p[0]}|${p[1]}`));
  return easy ? dictionary : null;
}

// Each card as a word to show: the book's word, reading and English; from the linked word its
// part of speech and usage labels; and an example sentence at the card's level (see
// exampleFor). The dictionary's usage note is left out: the book's English says how it's used.
const CARDS = new Map<string, VocabWord>(
  Object.values(LESSONS)
    .flat()
    .map((card) => {
      const linked = card.vocab === null ? undefined : BY_VOCAB_ID.get(card.vocab);
      const pos = linked?.pos ?? [];
      const word: VocabWord = {
        id: card.vocab ?? 0,
        rank: linked?.rank ?? 0,
        word: card.word,
        reading: card.reading,
        furigana: card.furigana,
        meanings: [card.meaning],
        pos,
        example: exampleFor(card, pos, linked?.example ?? null),
        topics: linked?.topics ?? [],
        labels: linked?.labels ?? [],
        note: null,
      };
      return [card.id, word];
    }),
);

export function genkiCard(id: string): VocabWord | null {
  return CARDS.get(id) ?? null;
}

// Every card, once each (a card in two lessons is one card).
export const GENKI_CARDS: readonly VocabWord[] = [...CARDS.values()];
