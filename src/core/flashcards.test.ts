import { EMPTY_PROGRESS } from './answers';
import { answerCard, currentCard, knownCards, markCard, nextCard, nextRound, roundOver, setWordFront, startRound } from './flashcards';

const DECK = ['a', 'b', 'c', 'd'];
const NOW = Date.UTC(2026, 9, 9, 9);
// Always the last index left: shuffle() then keeps the order as it is.
const inOrder = () => 0.999;
// Always index 0: shuffle() then turns a b c d into b c d a.
const turned = () => 0;

describe('which side of a card comes first', () => {
  it('is Japanese to start with, and can be English', () => {
    expect(EMPTY_PROGRESS.settings.wordFront).toBe('japanese');
    const english = setWordFront(EMPTY_PROGRESS, 'english');
    expect(english.settings.wordFront).toBe('english');
    expect(setWordFront(english, 'japanese').settings.wordFront).toBe('japanese');
  });
});

describe('knowing a card', () => {
  it('is remembered, and can be taken back', () => {
    const known = markCard(EMPTY_PROGRESS, 'a', true, NOW);
    expect(known.flashcards.a).toEqual({ known: true, at: NOW });
    expect(knownCards(known, DECK)).toEqual(['a']);
    const learning = markCard(known, 'a', false, NOW + 1000);
    expect(learning.flashcards.a).toEqual({ known: false, at: NOW + 1000 });
    expect(knownCards(learning, DECK)).toEqual([]);
    expect(EMPTY_PROGRESS.flashcards).toEqual({});
  });

  it('counts only cards in the deck', () => {
    const p = markCard(markCard(EMPTY_PROGRESS, 'a', true, NOW), 'z', true, NOW);
    expect(knownCards(p, DECK)).toEqual(['a']);
  });
});

describe('a round of flashcards', () => {
  it('goes through the cards in order, or shuffled', () => {
    expect(startRound(DECK, false, turned).cards).toEqual(DECK);
    expect(startRound(DECK, true, inOrder).cards).toEqual(DECK);
    expect(startRound(DECK, true, turned).cards).not.toEqual(DECK);
    expect([...startRound(DECK, true, turned).cards].sort()).toEqual(DECK);
  });

  it('sorts each card into known or still learning, and is over after the last', () => {
    let round = startRound(DECK, false, turned);
    expect(currentCard(round)).toBe('a');
    round = answerCard(round, true);
    round = answerCard(round, false);
    expect(currentCard(round)).toBe('c');
    round = answerCard(answerCard(round, true), false);
    expect(roundOver(round)).toBe(true);
    expect(currentCard(round)).toBeNull();
    expect(round.known).toEqual(['a', 'c']);
    expect(round.learning).toEqual(['b', 'd']);
    // Answering after the end changes nothing.
    expect(answerCard(round, true)).toEqual(round);
  });

  it('knows the card after the one showing, for drawing it ahead of time', () => {
    let round = startRound(DECK, false, turned);
    expect(nextCard(round)).toBe('b');
    round = answerCard(answerCard(round, true), true);
    expect(nextCard(round)).toBe('d');
    round = answerCard(round, true);
    expect(currentCard(round)).toBe('d');
    expect(nextCard(round)).toBeNull();
    expect(nextCard(answerCard(round, true))).toBeNull();
  });

  it('carries on with the cards still being learned, then starts the whole deck again', () => {
    let round = startRound(DECK, false, turned);
    for (const know of [true, false, true, false]) round = answerCard(round, know);
    round = nextRound(round, false, turned);
    expect(round.cards).toEqual(['b', 'd']);
    expect(round.known).toEqual([]);
    round = nextRound(answerCard(answerCard(round, true), true), false, turned);
    expect(round.cards).toEqual(DECK);
  });
});
