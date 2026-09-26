// A yōon like きゃ is written with two characters but is one kana. Places that size a kana
// for one character draw a two-character one smaller, by this much, so it fits the same space.
export function kanaFit(char: string, twoCharacters = 0.6): number {
  return char.length > 1 ? twoCharacters : 1;
}
