import { NAMED_PAIRS } from './pairs';

export type Script = 'hiragana' | 'katakana';

// Rows in the order they unlock.
export const ROWS = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'] as const;

export type RowId = (typeof ROWS)[number];

export type Kana = {
  char: string;
  script: Script;
  row: RowId;
  // First entry is the standard spelling; any others are accepted alternates.
  romaji: readonly [string, ...string[]];
};

// One line per sound: [row, hiragana, katakana, ...romaji]
const TABLE: readonly [RowId, string, string, string, ...string[]][] = [
  ['a', 'あ', 'ア', 'a'], ['a', 'い', 'イ', 'i'], ['a', 'う', 'ウ', 'u'], ['a', 'え', 'エ', 'e'], ['a', 'お', 'オ', 'o'],
  ['ka', 'か', 'カ', 'ka'], ['ka', 'き', 'キ', 'ki'], ['ka', 'く', 'ク', 'ku'], ['ka', 'け', 'ケ', 'ke'], ['ka', 'こ', 'コ', 'ko'],
  ['sa', 'さ', 'サ', 'sa'], ['sa', 'し', 'シ', 'shi', 'si'], ['sa', 'す', 'ス', 'su'], ['sa', 'せ', 'セ', 'se'], ['sa', 'そ', 'ソ', 'so'],
  ['ta', 'た', 'タ', 'ta'], ['ta', 'ち', 'チ', 'chi', 'ti'], ['ta', 'つ', 'ツ', 'tsu', 'tu'], ['ta', 'て', 'テ', 'te'], ['ta', 'と', 'ト', 'to'],
  ['na', 'な', 'ナ', 'na'], ['na', 'に', 'ニ', 'ni'], ['na', 'ぬ', 'ヌ', 'nu'], ['na', 'ね', 'ネ', 'ne'], ['na', 'の', 'ノ', 'no'],
  ['ha', 'は', 'ハ', 'ha'], ['ha', 'ひ', 'ヒ', 'hi'], ['ha', 'ふ', 'フ', 'fu', 'hu'], ['ha', 'へ', 'ヘ', 'he'], ['ha', 'ほ', 'ホ', 'ho'],
  ['ma', 'ま', 'マ', 'ma'], ['ma', 'み', 'ミ', 'mi'], ['ma', 'む', 'ム', 'mu'], ['ma', 'め', 'メ', 'me'], ['ma', 'も', 'モ', 'mo'],
  ['ya', 'や', 'ヤ', 'ya'], ['ya', 'ゆ', 'ユ', 'yu'], ['ya', 'よ', 'ヨ', 'yo'],
  ['ra', 'ら', 'ラ', 'ra'], ['ra', 'り', 'リ', 'ri'], ['ra', 'る', 'ル', 'ru'], ['ra', 'れ', 'レ', 're'], ['ra', 'ろ', 'ロ', 'ro'],
  ['wa', 'わ', 'ワ', 'wa'], ['wa', 'を', 'ヲ', 'wo'], ['wa', 'ん', 'ン', 'n'],
];

export const KANA: readonly Kana[] = TABLE.flatMap(([row, hiragana, katakana, first, ...rest]) => {
  const romaji: Kana['romaji'] = [first, ...rest];
  return [
    { char: hiragana, script: 'hiragana', row, romaji },
    { char: katakana, script: 'katakana', row, romaji },
  ];
});

function cleaned(input: string): string {
  return input.trim().toLowerCase();
}

export function matchesRomaji(kana: Kana, input: string): boolean {
  return kana.romaji.includes(cleaned(input));
}

// Every accepted spelling, of every kana.
const SPELLINGS: readonly string[] = [...new Set(KANA.flatMap((k) => k.romaji))];

// Whether a typed answer is finished: a whole spelling that no longer spelling starts with,
// so it can be checked without pressing Enter. "n" (ん) is the one that waits, since it could
// be the start of na, ni, nu, ne or no.
export function typingDone(input: string): boolean {
  const typed = cleaned(input);
  return SPELLINGS.includes(typed) && !SPELLINGS.some((s) => s !== typed && s.startsWith(typed));
}

// The kana in `script` that a typed answer spells, or null if it spells none.
export function kanaForRomaji(input: string, script: Script): Kana | null {
  const typed = cleaned(input);
  return KANA.find((k) => k.script === script && k.romaji.includes(typed)) ?? null;
}

// The kana that look like `char`: the other kana of every named pair it's in.
export function lookalikesOf(char: string): string[] {
  return NAMED_PAIRS.filter(({ kana }) => kana.includes(char)).flatMap(({ kana }) =>
    kana.filter((other) => other !== char),
  );
}
