import { clockWord, hourWord, minuteWord } from '@/core/time';
import { furiganaReading, type Furigana, type VocabWord } from '@/core/vocab';

// The time decks: the hours, the minutes (1 to 10, every five, all 59), times on the clock, and
// the words for asking and saying the time. A card is one card wherever it comes: 十五分 in
// every five minutes is the same card in all 59.

export type TimeDeck = { id: string; name: string; title: string; ids: readonly string[] };

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const HOURS = range(1, 12);

// A word for asking or saying the time, with an example sentence.
function timeWord(word: string, furigana: Furigana, meaning: string, example: { ja: Furigana; en: string }): VocabWord {
  return {
    id: 0,
    rank: 0,
    word,
    reading: furiganaReading(furigana),
    furigana,
    meanings: [meaning],
    pos: ['n-t'],
    example,
    topics: ['time'],
    labels: [],
    note: null,
  };
}

const WORDS: readonly (readonly [id: string, word: VocabWord])[] = [
  ['time:now', timeWord('今', [['今', 'いま']], 'now', { ja: [['今', 'いま'], ['、'], ['何', 'なん'], ['時', 'じ'], ['ですか。']], en: 'What time is it now?' })],
  ['time:what-hour', timeWord('何時', [['何', 'なん'], ['時', 'じ']], 'what time', { ja: [['何', 'なん'], ['時', 'じ'], ['ですか。']], en: 'What time is it?' })],
  [
    'time:what-minute',
    timeWord('何分', [['何', 'なん'], ['分', 'ぷん']], 'how many minutes', {
      ja: [['何', 'なん'], ['分', 'ぷん'], ['かかりますか。']],
      en: 'How many minutes does it take?',
    }),
  ],
  ['time:half', timeWord('半', [['半', 'はん']], 'half past (:30)', { ja: [['二', 'に'], ['時', 'じ'], ['半', 'はん'], ['です。']], en: "It's half past two." })],
  ['time:am', timeWord('午前', [['午前', 'ごぜん']], 'A.M.', { ja: [['午前', 'ごぜん'], ['十', 'じゅう'], ['時', 'じ'], ['です。']], en: "It's 10 A.M." })],
  [
    'time:pm',
    timeWord('午後', [['午後', 'ごご']], 'P.M.', { ja: [['午後', 'ごご'], ['三', 'さん'], ['時', 'じ'], ['半', 'はん'], ['です。']], en: "It's 3:30 P.M." }),
  ],
  [
    'time:exactly',
    timeWord('ちょうど', [['ちょうど']], 'exactly, on the dot', { ja: [['ちょうど'], ['一', 'いち'], ['時', 'じ'], ['です。']], en: "It's one o'clock exactly." }),
  ],
  [
    'time:an-hour',
    timeWord('一時間', [['一', 'いち'], ['時', 'じ'], ['間', 'かん']], 'one hour (long)', {
      ja: [['一', 'いち'], ['時', 'じ'], ['間', 'かん'], ['勉強', 'べんきょう'], ['します。']],
      en: 'I study for an hour.',
    }),
  ],
];

const CARDS = new Map<string, VocabWord>([
  ...HOURS.map((h) => [`time:${h}:00`, hourWord(h)] as const),
  ...range(1, 59).map((m) => [`time:${m}min`, minuteWord(m)] as const),
  ...HOURS.flatMap((h) => [10, 15, 30, 45].map((m) => [`time:${h}:${m}`, clockWord(h, m)] as const)),
  ...WORDS,
]);

export const TIME_DECKS: readonly TimeDeck[] = [
  { id: 'time-hours', name: 'Hours', title: '1:00 to 12:00', ids: HOURS.map((h) => `time:${h}:00`) },
  { id: 'time-minutes-1-10', name: 'Minutes', title: '1 to 10 minutes', ids: range(1, 10).map((m) => `time:${m}min`) },
  {
    id: 'time-minutes-fives',
    name: 'Minutes',
    title: 'Every five minutes, and half past',
    ids: [...range(1, 11).map((i) => `time:${i * 5}min`), 'time:half'],
  },
  { id: 'time-minutes-all', name: 'Minutes', title: 'All of them, 1 to 59', ids: range(1, 59).map((m) => `time:${m}min`) },
  {
    id: 'time-clock',
    name: 'Telling the time',
    title: 'Hours and minutes together',
    ids: HOURS.flatMap((h) => [10, 15, 30, 45].map((m) => `time:${h}:${m}`)),
  },
  { id: 'time-words', name: 'Words', title: 'Asking and saying the time', ids: WORDS.map(([id]) => id) },
];

export function timeDeck(id: string): TimeDeck | null {
  return TIME_DECKS.find((d) => d.id === id) ?? null;
}

export function timeCard(id: string): VocabWord | null {
  return CARDS.get(id) ?? null;
}

// Every time card.
export const TIME_CARDS: readonly VocabWord[] = [...CARDS.values()];
