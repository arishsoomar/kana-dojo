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

export function matchesRomaji(kana: Kana, input: string): boolean {
  const answer = input.trim().toLowerCase();
  return kana.romaji.includes(answer);
}

// Groups of kana that learners commonly mix up.
export const LOOKALIKES: readonly (readonly string[])[] = [
  ['シ', 'ツ'],
  ['ソ', 'ン'],
  ['ぬ', 'め'],
  ['わ', 'ね', 'れ'],
  ['る', 'ろ'],
  ['さ', 'ち'],
];

export function lookalikesOf(char: string): string[] {
  return LOOKALIKES.filter((group) => group.includes(char)).flatMap((group) =>
    group.filter((other) => other !== char),
  );
}
