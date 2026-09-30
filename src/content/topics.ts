import type { TopicId } from '@/core/vocab';

// The word deck's topics, in the order they're shown, with a kanji for each (as a small icon).
// Which words are in which is worked out when the deck is built (scripts/build-vocab.mjs).
export const TOPICS: readonly { id: TopicId; name: string; kanji: string }[] = [
  { id: 'food', name: 'Food & drink', kanji: '食' },
  { id: 'places', name: 'Places & travel', kanji: '旅' },
  { id: 'people', name: 'People & family', kanji: '人' },
  { id: 'time', name: 'Time', kanji: '時' },
  { id: 'body', name: 'Body & health', kanji: '体' },
  { id: 'feelings', name: 'Feelings', kanji: '心' },
  { id: 'nature', name: 'Nature & weather', kanji: '空' },
  { id: 'animals', name: 'Animals', kanji: '犬' },
  { id: 'home', name: 'Home & things', kanji: '家' },
  { id: 'work', name: 'Work & school', kanji: '学' },
  { id: 'numbers', name: 'Numbers & amounts', kanji: '数' },
  { id: 'talk', name: 'Talking & thinking', kanji: '話' },
];
