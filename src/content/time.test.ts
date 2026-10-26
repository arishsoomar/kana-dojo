import { furiganaReading, furiganaText } from '@/core/vocab';

import { TIME_CARDS, TIME_DECKS, timeCard, timeDeck } from './time';

const words = (deck: string) => timeDeck(deck)!.ids.map((id) => timeCard(id)!.word);

describe('the time decks', () => {
  it('has the hours, the minutes, clock times and the words, every card in it', () => {
    expect(TIME_DECKS.map((d) => [d.id, d.ids.length])).toEqual([
      ['time-hours', 12],
      ['time-minutes-1-10', 10],
      ['time-minutes-fives', 12],
      ['time-minutes-all', 59],
      ['time-clock', 48],
      ['time-words', 8],
    ]);
    for (const deck of TIME_DECKS) {
      expect(deck.ids.filter((id) => timeCard(id) === null)).toEqual([]);
      expect(new Set(deck.ids).size).toBe(deck.ids.length);
    }
  });

  it('counts by fives with half past at the end, and puts the hours and minutes together', () => {
    expect(words('time-minutes-fives')).toEqual(['五分', '十分', '十五分', '二十分', '二十五分', '三十分', '三十五分', '四十分', '四十五分', '五十分', '五十五分', '半']);
    expect(words('time-clock').slice(0, 4)).toEqual(['一時十分', '一時十五分', '一時半', '一時四十五分']);
  });

  it('shares a card between decks', () => {
    expect(timeDeck('time-minutes-fives')!.ids[2]).toBe(timeDeck('time-minutes-all')!.ids[14]);
  });

  it("gives every card furigana that spell it, and every example's too", () => {
    for (const w of TIME_CARDS) {
      expect(furiganaText(w.furigana)).toBe(w.word);
      expect(furiganaReading(w.furigana)).toBe(w.reading);
    }
    expect(furiganaText(timeCard('time:now')!.example!.ja)).toBe('今、何時ですか。');
  });
});
