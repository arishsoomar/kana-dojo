import { furiganaReading, furiganaText, type Furigana, type VocabWord } from '@/core/vocab';

// Homework decks: words from class, each set as it was given, with its English.

export type HomeworkDeck = { id: string; name: string; title: string; ids: readonly string[] };

// A homework word, from its furigana and what it means.
function homeworkWord(furigana: Furigana, meaning: string): VocabWord {
  return {
    id: 0,
    rank: 0,
    word: furiganaText(furigana),
    reading: furiganaReading(furigana),
    furigana,
    meanings: [meaning],
    pos: [],
    example: null,
    topics: [],
    labels: [],
    note: null,
  };
}

const HW1: readonly (readonly [id: string, word: VocabWord])[] = [
  ['hw1:atarashii', homeworkWord([['新', 'あたら'], ['しい']], 'new')],
  ['hw1:shoukai-shimasu', homeworkWord([['紹', 'しょう'], ['介', 'かい'], ['します']], 'to introduce')],
  ['hw1:jikoshoukai', homeworkWord([['自', 'じ'], ['己', 'こ'], ['紹', 'しょう'], ['介', 'かい']], 'self-introduction')],
  ['hw1:onegaishimasu', homeworkWord([['お'], ['願', 'ねが'], ['いします']], 'please')],
  ['hw1:sengetsu', homeworkWord([['先', 'せん'], ['月', 'げつ']], 'last month')],
  ['hw1:kimashita', homeworkWord([['来', 'き'], ['ました']], 'came')],
  ['hw1:madamada-desu', homeworkWord([['まだまだです']], 'I still have a lot to learn')],
  ['hw1:onaji', homeworkWord([['同', 'おな'], ['じ']], 'same')],
  ['hw1:wakarimashita', homeworkWord([['わかりました']], 'I understand / Got it')],
  ['hw1:goshusshin', homeworkWord([['ご'], ['出', 'しゅっ'], ['身', 'しん']], 'hometown / place of origin')],
  ['hw1:yuumei', homeworkWord([['有', 'ゆう'], ['名', 'めい']], 'famous')],
  ['hw1:goyukkuri', homeworkWord([['ごゆっくり']], 'Take your time / Enjoy your stay')],
];

export const HOMEWORK_DECKS: readonly HomeworkDeck[] = [{ id: 'hw1', name: 'Homework', title: 'HW1', ids: HW1.map(([id]) => id) }];

export function homeworkDeck(id: string): HomeworkDeck | null {
  return HOMEWORK_DECKS.find((d) => d.id === id) ?? null;
}

const CARDS = new Map(HW1);

export function homeworkCard(id: string): VocabWord | null {
  return CARDS.get(id) ?? null;
}

// Every homework word.
export const HOMEWORK_CARDS: readonly VocabWord[] = [...CARDS.values()];
