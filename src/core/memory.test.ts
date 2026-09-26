import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import {
  dealMemory,
  fewestMoves,
  flipCard,
  hideMiss,
  MEMORY_PAIRS,
  memoryId,
  memoryKana,
  memoryReady,
} from './memory';

const rng = () => 0.5;

// Progress where the あ to な rows are open and met (green belt), in both scripts.
const rows = [...'あいうえおかきくけこさしすせそたちつてとなにぬねの'];
const katakana = [...'アイウエオカキクケコサシスセソタチツテトナニヌネノ'];
const LEARNER: Progress = {
  ...EMPTY_PROGRESS,
  kana: Object.fromEntries([...rows, ...katakana].map((c) => [c, { box: 3, at: 1 }])),
};

describe('which kana a mode can use', () => {
  it('uses the met kana of one script, or for both, sounds met in both', () => {
    const onlyHiragana: Progress = { ...EMPTY_PROGRESS, kana: Object.fromEntries(rows.map((c) => [c, { box: 3, at: 1 }])) };
    expect(memoryKana(onlyHiragana, 'hiragana')).toHaveLength(25);
    expect(memoryKana(onlyHiragana, 'katakana')).toHaveLength(0);
    expect(memoryKana(onlyHiragana, 'both')).toHaveLength(0);
    expect(memoryKana(LEARNER, 'both')).toHaveLength(25);
  });

  it(`needs ${MEMORY_PAIRS} of them`, () => {
    expect(memoryReady(LEARNER, 'hiragana')).toBe(true);
    expect(memoryReady(EMPTY_PROGRESS, 'hiragana')).toBe(false);
  });
});

describe('dealMemory', () => {
  it('deals 16 cards, 8 pairs, each pair a kana and its romaji', () => {
    const game = dealMemory(LEARNER, 'hiragana', rng);
    expect(game.cards).toHaveLength(2 * MEMORY_PAIRS);
    for (let pair = 0; pair < MEMORY_PAIRS; pair++) {
      const two = game.cards.filter((c) => c.pair === pair);
      expect(two).toHaveLength(2);
      const [kanaCard, romajiCard] = [two.find((c) => c.face === c.kana.char), two.find((c) => c.face !== c.kana.char)];
      expect(kanaCard?.kana.script).toBe('hiragana');
      expect(romajiCard?.face).toBe(kanaCard?.kana.romaji[0]);
    }
  });

  it('pairs hiragana with katakana in "both"', () => {
    const game = dealMemory(LEARNER, 'both', rng);
    for (let pair = 0; pair < MEMORY_PAIRS; pair++) {
      const scripts = game.cards.filter((c) => c.pair === pair).map((c) => c.kana.script).sort();
      expect(scripts).toEqual(['hiragana', 'katakana']);
    }
  });

  it('never deals two pairs with the same spelling', () => {
    for (const r of [0, 0.4, 0.9]) {
      const game = dealMemory(LEARNER, 'hiragana', () => r);
      const sounds = new Set(game.cards.map((c) => c.kana.romaji[0]));
      expect(sounds.size).toBe(MEMORY_PAIRS);
    }
  });

  it('starts with every card face down, no moves and nothing found', () => {
    const game = dealMemory(LEARNER, 'katakana', rng);
    expect(game.up).toEqual([]);
    expect(game.found).toEqual([]);
    expect(game.moves).toBe(0);
  });
});

describe('flipCard', () => {
  const game = dealMemory(LEARNER, 'hiragana', rng);
  const [first, ...rest] = game.cards;
  const partner = rest.find((c) => c.pair === first!.pair)!;
  const stranger = rest.find((c) => c.pair !== first!.pair)!;

  it('turns one card up, which is not yet a move', () => {
    const { game: next, flip } = flipCard(game, first!.id);
    expect(next.up).toEqual([first!.id]);
    expect(next.moves).toBe(0);
    expect(flip).toEqual({ kind: 'first' });
  });

  it('finds a pair with its partner: a move, and both stay up', () => {
    const one = flipCard(game, first!.id).game;
    const { game: next, flip } = flipCard(one, partner.id);
    expect(flip).toEqual({ kind: 'pair', pair: first!.pair });
    expect(next.found).toEqual([first!.pair]);
    expect(next.up).toEqual([]);
    expect(next.moves).toBe(1);
  });

  it('misses with any other card: a move, and both wait to be turned back', () => {
    const one = flipCard(game, first!.id).game;
    const { game: next, flip } = flipCard(one, stranger.id);
    expect(flip).toEqual({ kind: 'miss' });
    expect(next.up).toEqual([first!.id, stranger.id]);
    expect(next.moves).toBe(1);
    expect(hideMiss(next).up).toEqual([]);
  });

  it('ignores a card that is already up or found, and a third card while two are up', () => {
    const one = flipCard(game, first!.id).game;
    expect(flipCard(one, first!.id).flip).toEqual({ kind: 'ignored' });
    const missed = flipCard(one, stranger.id).game;
    const third = rest.find((c) => c.id !== stranger.id && c.id !== partner.id)!;
    expect(flipCard(missed, third.id).flip).toEqual({ kind: 'ignored' });
    const found = flipCard(one, partner.id).game;
    expect(flipCard(found, partner.id).flip).toEqual({ kind: 'ignored' });
  });

  it('is done when every pair is found', () => {
    let current = game;
    for (let pair = 0; pair < MEMORY_PAIRS; pair++) {
      const [a, b] = current.cards.filter((c) => c.pair === pair);
      current = flipCard(flipCard(current, a!.id).game, b!.id).game;
    }
    expect(current.done).toBe(true);
    expect(current.moves).toBe(MEMORY_PAIRS);
  });

  it('never changes the game it was given', () => {
    const snapshot = structuredClone(game);
    flipCard(flipCard(game, first!.id).game, stranger.id);
    expect(game).toEqual(snapshot);
  });
});

describe('fewestMoves', () => {
  it('is the lowest score saved for a mode, or null', () => {
    expect(fewestMoves(EMPTY_PROGRESS, 'hiragana')).toBeNull();
    let progress = completeLesson(EMPTY_PROGRESS, memoryId('hiragana'), 1, 20);
    progress = completeLesson(progress, memoryId('hiragana'), 2, 14);
    progress = completeLesson(progress, memoryId('katakana'), 3, 9);
    expect(fewestMoves(progress, 'hiragana')).toBe(14);
  });

  it('keeps each mode apart', () => {
    expect(new Set((['hiragana', 'katakana', 'both'] as const).map(memoryId)).size).toBe(3);
  });
});
