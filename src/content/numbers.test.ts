import { NUMBER_DECKS, numberCard, numberDeck } from './numbers';

describe('the number decks', () => {
  it('has ten decks of ten, one of all 100, and the big numbers by place and together, every card a number', () => {
    expect(NUMBER_DECKS.map((d) => d.ids.length)).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 100, 9, 9, 9, 27]);
    for (const deck of NUMBER_DECKS) expect(deck.ids.filter((id) => numberCard(id) === null)).toEqual([]);
  });

  it('shares cards between a ten and all 100, so knowing one is knowing the other', () => {
    expect(numberDeck('numbers-21-30')!.ids[0]).toBe(numberDeck('numbers-1-100')!.ids[20]);
    expect(numberCard(numberDeck('numbers-21-30')!.ids[0]!)!.word).toBe('二十一');
  });

  it('names the big number decks by their range, with commas', () => {
    expect(NUMBER_DECKS.slice(11).map((d) => [d.id, d.title])).toEqual([
      ['numbers-100-900', '100 to 900'],
      ['numbers-1000-9000', '1,000 to 9,000'],
      ['numbers-10000-90000', '10,000 to 90,000'],
      ['numbers-100-90000', '100 to 90,000'],
    ]);
    expect(numberCard(numberDeck('numbers-100-900')!.ids[5]!)!.word).toBe('六百');
  });

  it('shares 100 between 91 to 100 and the hundreds', () => {
    expect(numberDeck('numbers-91-100')!.ids.at(-1)).toBe(numberDeck('numbers-100-900')!.ids[0]);
  });
});
