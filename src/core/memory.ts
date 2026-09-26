import type { Progress } from './answers';
import { KANA, type Kana } from './kana';
import { pickNext } from './pick';
import { shuffle, type Rng } from './random';
import { metKana } from './unlock';

// Memory match: sixteen cards face down, eight pairs. A pair is a kana and its romaji, or in
// "both", the same sound in hiragana and in katakana.

export const MEMORY_PAIRS = 8;

// Which pairs to play: hiragana with romaji, katakana with romaji, or hiragana with katakana.
export type MemoryMode = 'hiragana' | 'katakana' | 'both';

// Where a mode's games are saved, with the moves taken as the score.
export function memoryId(mode: MemoryMode): string {
  return `game:memory:${mode}`;
}

// The same sound in katakana, for a hiragana kana, or null (no hiragana has an extended
// katakana partner, but every katakana outside the extended rows has one).
function katakanaOf(kana: Kana): Kana | null {
  return KANA.find((k) => k.script === 'katakana' && k.row === kana.row && k.romaji[0] === kana.romaji[0]) ?? null;
}

// The kana a mode can deal: the met kana of its script, or for "both", the hiragana whose
// katakana partner has been met too.
export function memoryKana(progress: Progress, mode: MemoryMode): Kana[] {
  if (mode !== 'both') return metKana(progress, mode);
  const katakana = new Set(metKana(progress, 'katakana'));
  return metKana(progress, 'hiragana').filter((k) => {
    const partner = katakanaOf(k);
    return partner !== null && katakana.has(partner);
  });
}

// Whether there are enough kana to deal a game.
export function memoryReady(progress: Progress, mode: MemoryMode): boolean {
  return memoryKana(progress, mode).length >= MEMORY_PAIRS;
}

// One card: its place in the deal (`id`), which pair it belongs to, what's written on it,
// and the kana it stands for.
export type MemoryCard = { id: number; pair: number; face: string; kana: Kana };

export type MemoryGame = {
  mode: MemoryMode;
  cards: MemoryCard[];
  up: number[]; // ids of the cards turned up and not yet found: none, one, or a missed two
  found: number[]; // pairs found
  moves: number; // each second card turned is a move
  done: boolean;
};

// Deals a game: 8 kana from the ones the mode can use (weaker ones more often, and never two
// with the same spelling, like じ and ぢ), each as a pair of cards, shuffled.
export function dealMemory(progress: Progress, mode: MemoryMode, rng: Rng): MemoryGame {
  const pool = memoryKana(progress, mode);
  const chosen: Kana[] = [];
  while (chosen.length < MEMORY_PAIRS) {
    const candidates = pool.filter((k) => !chosen.some((c) => c.romaji.some((r) => k.romaji.includes(r))));
    if (candidates.length === 0) break;
    chosen.push(pickNext(progress, candidates, rng));
  }
  const cards = chosen.flatMap((kana, pair) => {
    const partner = mode === 'both' ? katakanaOf(kana) : null;
    return [
      { pair, face: kana.char, kana },
      partner ? { pair, face: partner.char, kana: partner } : { pair, face: kana.romaji[0], kana },
    ];
  });
  return {
    mode,
    cards: shuffle(cards, rng).map((card, id) => ({ ...card, id })),
    up: [],
    found: [],
    moves: 0,
    done: false,
  };
}

// What turning a card did: the first of two, a pair found, a miss, or nothing (a card that
// can't be turned now).
export type Flip = { kind: 'first' } | { kind: 'pair'; pair: number } | { kind: 'miss' } | { kind: 'ignored' };

export function flipCard(game: MemoryGame, id: number): { game: MemoryGame; flip: Flip } {
  const card = game.cards.find((c) => c.id === id);
  const ignored = { game, flip: { kind: 'ignored' } as const };
  if (!card || game.done || game.up.length >= 2 || game.up.includes(id) || game.found.includes(card.pair)) return ignored;

  const [firstId] = game.up;
  if (firstId === undefined) return { game: { ...game, up: [id] }, flip: { kind: 'first' } };

  const first = game.cards.find((c) => c.id === firstId);
  const moves = game.moves + 1;
  if (first?.pair === card.pair) {
    const found = [...game.found, card.pair];
    return { game: { ...game, up: [], found, moves, done: found.length === game.cards.length / 2 }, flip: { kind: 'pair', pair: card.pair } };
  }
  return { game: { ...game, up: [firstId, id], moves }, flip: { kind: 'miss' } };
}

// Turns a missed two back over.
export function hideMiss(game: MemoryGame): MemoryGame {
  return { ...game, up: [] };
}

// The fewest moves a mode has been finished in, or null if never.
export function fewestMoves(progress: Progress, mode: MemoryMode): number | null {
  const scores = progress.completed.flatMap((c) => (c.lesson === memoryId(mode) && c.score !== undefined ? [c.score] : []));
  return scores.length === 0 ? null : Math.min(...scores);
}
