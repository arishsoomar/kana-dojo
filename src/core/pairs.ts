// Lookalike kana that learners commonly mix up, two at a time. Each pair has a name (for its
// duel and scroll) and a tip for telling the two apart. These pairs are also what makes two
// kana count as lookalikes (see lookalikesOf in kana.ts).

export type NamedPair = {
  kana: readonly [string, string];
  name: string;
  tip: string;
};

export const NAMED_PAIRS: readonly NamedPair[] = [
  // Hiragana
  { kana: ['あ', 'お'], name: 'The flying dash', tip: 'お has a little dash off to the top right. あ has no dash.' },
  { kana: ['い', 'り'], name: 'The reeds and the eels', tip: "い's two strokes are about the same height. り's right stroke is much longer and sweeps down." },
  { kana: ['き', 'さ'], name: 'The extra bar', tip: 'き has two crossbars. さ has only one.' },
  { kana: ['こ', 'に'], name: 'The two steps', tip: 'に has a tall stroke down its left side. こ is just the two short lines.' },
  { kana: ['さ', 'ち'], name: 'The mirror pair', tip: 'ち curves out to the right, like the bottom of a 5. さ is the mirror image: its curve bulges to the left.' },
  { kana: ['ぬ', 'め'], name: 'The loop and the eye', tip: 'ぬ ends in a little loop at the bottom right. め has no loop.' },
  { kana: ['は', 'ほ'], name: 'The laughing pair', tip: "ほ has two bars on the right with a flat top. は has one bar, with its stroke poking up above it." },
  { kana: ['わ', 'ね'], name: 'The cat and the duck', tip: 'ね ends in a little loop. わ ends in a smooth curve with no loop.' },
  { kana: ['わ', 'れ'], name: 'The duck and the ray', tip: 'れ ends with a tail that kicks out to the right. わ curves back in and stays round.' },
  { kana: ['ね', 'れ'], name: 'The cat and the ray', tip: 'ね ends in a little loop. れ ends with a tail that kicks out to the right.' },
  { kana: ['る', 'ろ'], name: 'The open road', tip: 'る ends in a loop at the bottom. ろ is open, with no loop.' },

  // Katakana
  { kana: ['シ', 'ツ'], name: 'The shadow twins', tip: "シ's short strokes stack on the left and its long stroke sweeps up. ツ's short strokes sit on top and its long stroke sweeps down." },
  { kana: ['ソ', 'ン'], name: 'The rise and the fall', tip: "ソ's short stroke sits on top and its long stroke falls down. ン's short stroke sits on the left and its long stroke sweeps up." },
  { kana: ['ウ', 'ワ'], name: 'The roof tick', tip: 'ウ has a short tick on top of its roof. ワ has none.' },
  { kana: ['フ', 'ワ'], name: 'The wall and the slope', tip: 'ワ has a short stroke down its left side. フ has none.' },
  { kana: ['ク', 'タ'], name: 'The empty tent', tip: 'タ has an extra short stroke inside. ク is empty inside.' },
  { kana: ['ス', 'ヌ'], name: 'The crossed stroke', tip: "ヌ's short stroke cuts across the middle. ス's short stroke hangs off the bottom right without crossing." },
  { kana: ['コ', 'ユ'], name: 'The corner and the U-turn', tip: "ユ's bottom line sticks out past its side. コ's lines meet at a clean corner." },
  { kana: ['チ', 'テ'], name: 'The pole and the pom-pom', tip: 'チ has one slanted stroke on top and a line crossing its middle. テ has two flat bars on top, and nothing crosses.' },
];

// A pair's id, for addresses and saved records: its two kana, e.g. "シツ".
export function pairId(pair: NamedPair): string {
  return pair.kana.join('');
}

// The named pair with this id, or null if there isn't one.
export function pairById(id: string): NamedPair | null {
  return NAMED_PAIRS.find((pair) => pairId(pair) === id) ?? null;
}
