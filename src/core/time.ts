import { numberPieces } from './numbers';
import type { VocabWord } from './vocab';

// Telling the time, as words to learn whole: the hours (三時, さんじ), the minutes (十五分,
// じゅうごふん) and the two together (三時十五分), so 3:15 reads on sight. Both bend the
// numbers' sounds: 4, 7 and 9 o'clock take the old readings, and 分 is ふん or ぷん after
// whatever comes before it.

type Piece = [kanji: string, reading: string];

// The hours that use 4, 7 and 9's old readings, and what they aren't.
const HOUR_READING: Readonly<Record<number, { reading: string; note: string }>> = {
  4: { reading: 'よ', note: 'Not よんじ' },
  7: { reading: 'しち', note: 'Not ななじ' },
  9: { reading: 'く', note: 'Not きゅうじ' },
};

function hourPieces(hour: number): Piece[] {
  const pieces = numberPieces(hour);
  const odd = HOUR_READING[hour];
  if (odd) pieces[pieces.length - 1] = [pieces[pieces.length - 1]![0], odd.reading];
  return [...pieces, ['時', 'じ']];
}

// 分 after a number's last sound: ぷん after 1, 3, 4, 6, 8 and 10 (with いっ, ろっ, はっ, じゅっ
// before it), ふん after 2, 5, 7 and 9.
const MINUTE_SOUND: Readonly<Record<string, readonly [before: string, fun: string]>> = {
  いち: ['いっ', 'ぷん'],
  に: ['に', 'ふん'],
  さん: ['さん', 'ぷん'],
  よん: ['よん', 'ぷん'],
  ご: ['ご', 'ふん'],
  ろく: ['ろっ', 'ぷん'],
  なな: ['なな', 'ふん'],
  はち: ['はっ', 'ぷん'],
  きゅう: ['きゅう', 'ふん'],
  じゅう: ['じゅっ', 'ぷん'],
};

const MINUTE_NOTE: Readonly<Record<number, string>> = {
  8: 'Also はちふん',
  10: 'Also じっぷん',
};

function minutePieces(minutes: number): Piece[] {
  const pieces = numberPieces(minutes);
  const last = pieces[pieces.length - 1]!;
  const [before, fun] = MINUTE_SOUND[last[1]]!;
  pieces[pieces.length - 1] = [last[0], before];
  return [...pieces, ['分', fun]];
}

function timeWord(pieces: Piece[], meaning: string, note: string | null): VocabWord {
  return {
    id: 0,
    rank: 0,
    word: pieces.map((p) => p[0]).join(''),
    reading: pieces.map((p) => p[1]).join(''),
    furigana: pieces,
    meanings: [meaning],
    pos: ['n-t'],
    example: null,
    topics: ['time'],
    labels: [],
    note,
  };
}

// An hour on the clock, 1 to 12: 三時, 3:00.
export function hourWord(hour: number): VocabWord {
  return timeWord(hourPieces(hour), `${hour}:00`, HOUR_READING[hour]?.note ?? null);
}

// Minutes, 1 to 59: 十五分, 15 minutes. The same word for minutes on the clock (3:15) and minutes
// long (15 minutes' walk).
export function minuteWord(minutes: number): VocabWord {
  return timeWord(minutePieces(minutes), `${minutes} minute${minutes === 1 ? '' : 's'}`, MINUTE_NOTE[minutes] ?? null);
}

// A time on the clock: 三時十五分 (3:15), or 三時半 for half past.
export function clockWord(hour: number, minutes: number): VocabWord {
  const after: Piece[] = minutes === 30 ? [['半', 'はん']] : minutes === 0 ? [] : minutePieces(minutes);
  const notes = [HOUR_READING[hour]?.note, MINUTE_NOTE[minutes]].filter((n) => n !== undefined);
  return timeWord([...hourPieces(hour), ...after], `${hour}:${String(minutes).padStart(2, '0')}`, notes.length > 0 ? notes.join(' · ') : null);
}
