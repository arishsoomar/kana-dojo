import { NAMED_PAIRS } from './pairs';

export type Script = 'hiragana' | 'katakana';

// Rows in the order they unlock: the 46 basic kana, then the rows made by adding a mark,
// then the yōon (combined sounds like きゃ).
export const ROWS = [
  'a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa',
  'ga', 'za', 'da', 'ba', 'pa',
  'kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya',
] as const;

export type RowId = (typeof ROWS)[number];

// What kind of kana a row holds:
// - basic: the 46 plain kana
// - dakuten: with ゛, which voices the sound (か ka → が ga)
// - handakuten: with ゜, which turns the h-row into p (は ha → ぱ pa)
// - yoon: a kana with a small ゃ, ゅ or ょ, read as one sound (き + ゃ → きゃ kya)
export type RowKind = 'basic' | 'dakuten' | 'handakuten' | 'yoon';

const DAKUTEN_ROWS: readonly RowId[] = ['ga', 'za', 'da', 'ba'];

export function rowKind(row: RowId): RowKind {
  if (DAKUTEN_ROWS.includes(row)) return 'dakuten';
  if (row === 'pa') return 'handakuten';
  // The yōon rows are the ones after the ぱ row.
  if (ROWS.indexOf(row) > ROWS.indexOf('pa')) return 'yoon';
  return 'basic';
}

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
  // Dakuten. ぢ and づ sound the same as じ and ず, so they share those spellings.
  ['ga', 'が', 'ガ', 'ga'], ['ga', 'ぎ', 'ギ', 'gi'], ['ga', 'ぐ', 'グ', 'gu'], ['ga', 'げ', 'ゲ', 'ge'], ['ga', 'ご', 'ゴ', 'go'],
  ['za', 'ざ', 'ザ', 'za'], ['za', 'じ', 'ジ', 'ji', 'zi'], ['za', 'ず', 'ズ', 'zu'], ['za', 'ぜ', 'ゼ', 'ze'], ['za', 'ぞ', 'ゾ', 'zo'],
  ['da', 'だ', 'ダ', 'da'], ['da', 'ぢ', 'ヂ', 'ji', 'di'], ['da', 'づ', 'ヅ', 'zu', 'du'], ['da', 'で', 'デ', 'de'], ['da', 'ど', 'ド', 'do'],
  ['ba', 'ば', 'バ', 'ba'], ['ba', 'び', 'ビ', 'bi'], ['ba', 'ぶ', 'ブ', 'bu'], ['ba', 'べ', 'ベ', 'be'], ['ba', 'ぼ', 'ボ', 'bo'],
  // Handakuten.
  ['pa', 'ぱ', 'パ', 'pa'], ['pa', 'ぴ', 'ピ', 'pi'], ['pa', 'ぷ', 'プ', 'pu'], ['pa', 'ぺ', 'ペ', 'pe'], ['pa', 'ぽ', 'ポ', 'po'],
  // Yōon: two characters, read as one sound. (ぢゃ ぢゅ ぢょ are left out: they're very rare,
  // and sound the same as じゃ じゅ じょ.)
  ['kya', 'きゃ', 'キャ', 'kya'], ['kya', 'きゅ', 'キュ', 'kyu'], ['kya', 'きょ', 'キョ', 'kyo'],
  ['sha', 'しゃ', 'シャ', 'sha', 'sya'], ['sha', 'しゅ', 'シュ', 'shu', 'syu'], ['sha', 'しょ', 'ショ', 'sho', 'syo'],
  ['cha', 'ちゃ', 'チャ', 'cha', 'tya', 'cya'], ['cha', 'ちゅ', 'チュ', 'chu', 'tyu', 'cyu'], ['cha', 'ちょ', 'チョ', 'cho', 'tyo', 'cyo'],
  ['nya', 'にゃ', 'ニャ', 'nya'], ['nya', 'にゅ', 'ニュ', 'nyu'], ['nya', 'にょ', 'ニョ', 'nyo'],
  ['hya', 'ひゃ', 'ヒャ', 'hya'], ['hya', 'ひゅ', 'ヒュ', 'hyu'], ['hya', 'ひょ', 'ヒョ', 'hyo'],
  ['mya', 'みゃ', 'ミャ', 'mya'], ['mya', 'みゅ', 'ミュ', 'myu'], ['mya', 'みょ', 'ミョ', 'myo'],
  ['rya', 'りゃ', 'リャ', 'rya'], ['rya', 'りゅ', 'リュ', 'ryu'], ['rya', 'りょ', 'リョ', 'ryo'],
  ['gya', 'ぎゃ', 'ギャ', 'gya'], ['gya', 'ぎゅ', 'ギュ', 'gyu'], ['gya', 'ぎょ', 'ギョ', 'gyo'],
  ['ja', 'じゃ', 'ジャ', 'ja', 'zya', 'jya'], ['ja', 'じゅ', 'ジュ', 'ju', 'zyu', 'jyu'], ['ja', 'じょ', 'ジョ', 'jo', 'zyo', 'jyo'],
  ['bya', 'びゃ', 'ビャ', 'bya'], ['bya', 'びゅ', 'ビュ', 'byu'], ['bya', 'びょ', 'ビョ', 'byo'],
  ['pya', 'ぴゃ', 'ピャ', 'pya'], ['pya', 'ぴゅ', 'ピュ', 'pyu'], ['pya', 'ぴょ', 'ピョ', 'pyo'],
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
