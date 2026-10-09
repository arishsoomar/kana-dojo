import type { Progress } from './answers';
import { BELT_STARTS } from './boxes';
import { KANA, rowKind, type Kana } from './kana';

// When to start grammar. Lessons are written in hiragana (particles, endings, and every
// reading over the kanji), and the readings use ゛ and combined sounds (がくせい, きょうしつ),
// so those come first. Some words known from the flashcards, and katakana, make it easier, but
// aren't needed. Nothing is locked by this: it's advice, shown on the grammar path.

export const WORDS_BEFORE_GRAMMAR = 50;

export type ReadinessItem = {
  id: 'hiragana' | 'hiraganaMore' | 'words' | 'katakana';
  needed: boolean; // needed first, or just a help
  done: number;
  target: number;
};

// How many of these kana are at green belt or better.
function greenCount(progress: Progress, kana: readonly Kana[]): number {
  return kana.filter((k) => (progress.kana[k.char]?.box ?? 0) >= BELT_STARTS.green).length;
}

const HIRAGANA = KANA.filter((k) => k.script === 'hiragana' && rowKind(k.row) === 'basic');
const HIRAGANA_MORE = KANA.filter((k) => k.script === 'hiragana' && rowKind(k.row) !== 'basic');
const KATAKANA = KANA.filter((k) => k.script === 'katakana' && rowKind(k.row) === 'basic');

// Flashcards marked known, of any deck.
function knownCount(progress: Progress): number {
  return Object.values(progress.flashcards).filter((mark) => mark.known).length;
}

export function grammarReadiness(progress: Progress): { items: ReadinessItem[]; ready: boolean } {
  const items: ReadinessItem[] = [
    { id: 'hiragana', needed: true, done: greenCount(progress, HIRAGANA), target: HIRAGANA.length },
    { id: 'hiraganaMore', needed: true, done: greenCount(progress, HIRAGANA_MORE), target: HIRAGANA_MORE.length },
    { id: 'words', needed: false, done: Math.min(knownCount(progress), WORDS_BEFORE_GRAMMAR), target: WORDS_BEFORE_GRAMMAR },
    { id: 'katakana', needed: false, done: greenCount(progress, KATAKANA), target: KATAKANA.length },
  ];
  return { items, ready: items.every((i) => !i.needed || i.done >= i.target) };
}
