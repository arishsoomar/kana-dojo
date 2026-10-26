import type { VocabWord } from './vocab';

// The numbers 1 to 100 as words, to learn each one as a whole (see 21 and know it's にじゅういち,
// without building it from 2, 10 and 1), and GENKI's big numbers (lesson 2): the hundreds,
// thousands and ten thousands, 100 to 90,000. Written in kanji with furigana, read the way
// they're usually said: よん, なな and きゅう, which is how they come in every bigger number too.

const DIGITS: readonly (readonly [kanji: string, reading: string])[] = [
  ['', ''],
  ['一', 'いち'],
  ['二', 'に'],
  ['三', 'さん'],
  ['四', 'よん'],
  ['五', 'ご'],
  ['六', 'ろく'],
  ['七', 'なな'],
  ['八', 'はち'],
  ['九', 'きゅう'],
];

// The places past ten: 百, 千 and 万, each with its own sound changes.
const PLACES: readonly (readonly [value: number, kanji: string, reading: string])[] = [
  [10000, '万', 'まん'],
  [1000, '千', 'せん'],
  [100, '百', 'ひゃく'],
];

// Where a digit and its place run together: 三百 さんびゃく, 六百 ろっぴゃく. Keyed by digit × place.
const SOUND_CHANGES: Readonly<Record<number, readonly [digit: string, place: string]>> = {
  300: ['さん', 'びゃく'],
  600: ['ろっ', 'ぴゃく'],
  800: ['はっ', 'ぴゃく'],
  3000: ['さん', 'ぜん'],
  8000: ['はっ', 'せん'],
};

// GENKI's big numbers: 100 to 900, 1,000 to 9,000 and 10,000 to 90,000.
export const BIG_NUMBERS: readonly number[] = [...PLACES].reverse().flatMap(([place]) =>
  Array.from({ length: 9 }, (_, i) => (i + 1) * place),
);

// What's worth knowing about a number: the other reading of 4, 7 and 9 on their own, and the
// sound changes of the big numbers.
const NOTES: Readonly<Record<number, string>> = {
  4: 'Also read し',
  7: 'Also read しち',
  9: 'Also read く',
  100: 'Just ひゃく, never いちひゃく',
  300: 'Not さんひゃく: after 3, ひゃく becomes びゃく',
  600: 'Not ろくひゃく: ろく and ひゃく run together as ろっぴゃく',
  800: 'Not はちひゃく: はち and ひゃく run together as はっぴゃく',
  1000: 'Just せん, never いちせん',
  3000: 'Not さんせん: after 3, せん becomes ぜん',
  8000: 'Not はちせん: はち and せん run together as はっせん',
  10000: 'Always いちまん, never just まん (unlike 百 and 千)',
};

// A number in pieces: each kanji with its reading. 21 is 二 に, 十 じゅう, 一 いち; 300 is
// 三 さん, 百 びゃく. From 1 to 100, or one of the big numbers.
export function numberPieces(n: number): [kanji: string, reading: string][] {
  for (const [value, kanji, reading] of PLACES) {
    if (n < value) continue;
    const digit = n / value;
    const changed = SOUND_CHANGES[n];
    if (changed) return [[DIGITS[digit]![0], changed[0]], [kanji, changed[1]]];
    // 百 and 千 on their own, not 一百 and 一千; but 一万.
    if (digit === 1 && value < 10000) return [[kanji, reading]];
    return [[...DIGITS[digit]!], [kanji, reading]];
  }
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const pieces: [string, string][] = [];
  // 10 to 19 are 十, not 一十.
  if (tens > 1) pieces.push([...DIGITS[tens]!]);
  if (tens > 0) pieces.push(['十', 'じゅう']);
  if (ones > 0) pieces.push([...DIGITS[ones]!]);
  return pieces;
}

// A number in digits, with commas from 1,000: 30,000.
const digits = (n: number) => String(n).replace(/\B(?=(\d{3})+$)/g, ',');

// A number from 1 to 100, or a big one: its kanji and reading, and the number in digits as what
// it means.
export function numberWord(n: number): VocabWord {
  const pieces = numberPieces(n);
  return {
    id: 0,
    rank: 0,
    word: pieces.map((p) => p[0]).join(''),
    reading: pieces.map((p) => p[1]).join(''),
    furigana: pieces,
    meanings: [digits(n)],
    pos: ['num'],
    example: null,
    topics: ['numbers'],
    labels: [],
    note: NOTES[n] ?? null,
  };
}

// The numbers to study: 1 to 100 ten at a time, then all 100; then the big numbers a place at a
// time, then all of them. Each with what it's called and its range, in digits.
export type NumberSet = { name: string; title: string; numbers: readonly number[] };

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const numberSet = (name: string, numbers: readonly number[]): NumberSet => ({
  name,
  title: `${digits(numbers[0]!)} to ${digits(numbers.at(-1)!)}`,
  numbers,
});

export const NUMBER_SETS: readonly NumberSet[] = [
  ...Array.from({ length: 10 }, (_, i) => numberSet('Numbers', range(i * 10 + 1, i * 10 + 10))),
  numberSet('All of them', range(1, 100)),
  numberSet('Hundreds', BIG_NUMBERS.slice(0, 9)),
  numberSet('Thousands', BIG_NUMBERS.slice(9, 18)),
  numberSet('Ten thousands', BIG_NUMBERS.slice(18)),
  numberSet('All the big numbers', BIG_NUMBERS),
];
