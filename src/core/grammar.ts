import { hepburn } from './hepburn';
import type { Furigana, FuriganaPiece } from './vocab';

// Grammar lessons, one per lesson of GENKI I, each point in the book's order: a short
// explanation with examples, then sentences to say. A sentence card shows the English; say it
// in Japanese, then turn it over to check and hear it. The lessons themselves are in
// src/content/grammar/.
//
// Japanese is written with readings in brackets after the kanji they go over:
// 私[わたし]は学生[がくせい]です。 A sentence to say has a space between its words, so its romaji
// can be read word by word (は as the particle "wa"); {name} is the learner's name.

// A sentence to show, with its translation.
export type Example = { ja: string; en: string };

// A sentence to say: the English, and how it's said. `note` explains a catch, if there is one.
export type SayCard = { en: string; ja: string; note?: string };

export type GrammarPoint = {
  title: string;
  text: string; // English, with Japanese inline in kana
  examples: readonly Example[];
  say: readonly SayCard[];
};

export type GrammarLesson = {
  id: string; // genki-1
  lesson: number;
  title: string;
  goal: string; // what you'll be able to say
  points: readonly GrammarPoint[];
};

// The learner's name, as said in Japanese and as spelled in English. Until it's set, the name
// of GENKI's Mary.
export type MyName = { ja: string; en: string };
export const DEFAULT_NAME: MyName = { ja: 'メアリー', en: 'Mary' };

// --- Readings -----------------------------------------------------------------------------

const isKanji = (char: string) => /[㐀-鿿々〆ヶ]/.test(char);

// Lesson text as furigana pieces: a reading in brackets goes over the kanji just before it.
export function parseRuby(text: string): Furigana {
  const pieces: FuriganaPiece[] = [];
  let plain = '';
  let at = 0;
  while (at < text.length) {
    const open = text.indexOf('[', at);
    if (open < 0) {
      plain += text.slice(at);
      break;
    }
    const close = text.indexOf(']', open);
    let chunk = text.slice(at, open);
    // The kanji just before the bracket take the reading.
    let base = '';
    while (chunk.length > 0 && isKanji(chunk.slice(-1))) {
      base = chunk.slice(-1) + base;
      chunk = chunk.slice(0, -1);
    }
    plain += chunk;
    if (plain) pieces.push([plain]);
    plain = '';
    pieces.push([base, text.slice(open + 1, close)]);
    at = close + 1;
  }
  if (plain) pieces.push([plain]);
  return pieces;
}

// Lesson text without its readings: 私[わたし]は → 私は.
export function rubyText(text: string): string {
  return text.replace(/\[[^\]]*\]/g, '');
}

// Lesson text read aloud, in kana: 私[わたし]は → わたしは.
function rubyReading(text: string): string {
  return text.replace(/[㐀-鿿々〆ヶ]+\[([^\]]*)\]/g, '$1');
}

// --- Sentences to say ---------------------------------------------------------------------

// A sentence as it's shown and spoken: its words run together, the name filled in.
export function sayJapanese(ja: string, name: MyName): string {
  return ja.replaceAll('{name}', name.ja).replace(/ /g, '');
}

const PUNCTUATION: Readonly<Record<string, string>> = { '。': '.', '、': ',', '？': '?', '！': '!', '…': '...' };
// Particles read differently from their kana, and words whose sounds meet inside them (ううん is
// u-u-n, みずうみ is mizu + umi).
const SPELLED: Readonly<Record<string, string>> = { は: 'wa', へ: 'e', を: 'o', ううん: 'uun', みずうみ: 'mizuumi' };

// A sentence in romaji, word by word: 私[わたし] は {name} です。 is "Watashi wa Arish desu."
export function sayRomaji(ja: string, name: MyName): string {
  const words = ja.split(/ |(?<=[、。？！])(?! )/).map((word) => {
    const end = word.match(/[。、？！…]+$/)?.[0] ?? '';
    const core = word.slice(0, word.length - end.length);
    const said = [...end].map((p) => PUNCTUATION[p] ?? '').join('');
    if (core === '{name}') return name.en + said;
    // A verb written with kanji and ending in う (思う): its う is a sound of its own.
    const verbU = /([㐀-鿿]|\])う$/.test(core);
    return (SPELLED[core] ?? SPELLED[rubyReading(core)] ?? hepburn(rubyReading(core), { verbU }) ?? core) + said;
  });
  // さん joins the name before it, which is capitalised: Takeshi-san.
  const joined = words.reduce<string[]>((out, word) => {
    if (word.startsWith('san') && out.length > 0 && /^san\W*$/.test(word)) {
      const name = out.pop()!;
      out.push(`${name.charAt(0).toUpperCase()}${name.slice(1)}-${word}`);
    } else out.push(word);
    return out;
  }, []);
  // Each sentence starts with a capital.
  return joined.join(' ').replace(/(^|[.?!] )(\p{Ll})/gu, (_, before: string, letter: string) => before + letter.toUpperCase());
}

// The ids of a lesson's sentence cards, as their flashcards are kept: by point, then place.
export function sayCardIds(lesson: GrammarLesson): string[] {
  return lesson.points.flatMap((point, p) => point.say.map((_, i) => `say:${lesson.id}:${p}:${i}`));
}
