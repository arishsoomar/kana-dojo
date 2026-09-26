// A kana's level is its box, 0 to 9: three steps to each belt, and black at the top.
// A kana climbs by being answered right, quickly, and each belt asks for more speed
// (see climbLimit in answers.ts). There are no waiting times.
export const MAX_BOX = 9;

// Belts from lowest to highest.
export const BELTS = ['white', 'green', 'brown', 'black'] as const;

export type Belt = (typeof BELTS)[number];

// The box each belt starts at.
export const BELT_STARTS: Readonly<Record<Belt, number>> = { white: 0, green: 3, brown: 6, black: 9 };

export function tierOf(box: number): Belt {
  if (box >= BELT_STARTS.black) return 'black';
  if (box >= BELT_STARTS.brown) return 'brown';
  if (box >= BELT_STARTS.green) return 'green';
  return 'white';
}

// The learner's progress on one kana.
export type KanaProgress = {
  box: number;
  // When it was last answered, in milliseconds (like Date.now()), or 0 if never. Merging two
  // devices' progress keeps the copy answered most recently.
  at: number;
};
