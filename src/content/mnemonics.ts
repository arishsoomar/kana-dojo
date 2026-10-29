import data from './mnemonics.json';

// Memory tips for words, by card id: an English sound-alike (the keyword) caught in one scene
// with what the word means, the way Spanish "pepinillo" (pickle) is "pep knee". Each tip ends by
// saying where the keyword's sound differs from the word's, then how the card spells it in
// romaji, and the card's recording is the last thing heard. A word with no good sound-alike
// gets no keyword, and its tip builds it from parts you know (先月: 先 before, 月 month); some
// get no tip at all (numbers, grammar endings, katakana words that already sound like English).
//
// The tips and their pictures live in src/content/mnemonics.json (the pictures are fetched by
// scripts/fetch-pictures.mjs into src/constants/mnemonic-pictures.ts). What the research says
// is in docs/PROJECT.md, "Word mnemonics": keywords help a new word in fast, mostly Japanese →
// English, and can fade fast too, so they're shown on the back of the card, after you've tried
// to recall it, and the reviews carry on as usual.

export type WordMnemonic = {
  keyword: string | null; // the English sound-alike, or null when there's no good one
  tip: string;
};

export const WORD_MNEMONICS: Readonly<Record<string, WordMnemonic>> = data;

export function mnemonicFor(id: string | null): WordMnemonic | null {
  return id ? (WORD_MNEMONICS[id] ?? null) : null;
}
