import { isMark, splitWord, wordRomaji } from './forge';
import { shuffle, type Rng } from './random';

// The reading room: reading for meaning. Signs as they're written up in real places ("Find:
// exit", from four signs at the station). Word Forge reads words aloud; here the question is
// what they say. Only signs written with kana the learner has met are used.

export type PlaceId = 'station' | 'cafe' | 'shop' | 'street';

export type Sign = { text: string; meaning: string };

export type Place = {
  id: PlaceId;
  name: string; // "The station"
  kana: string; // what it's called, in kana: えき
  signs: readonly Sign[];
};

// Ready signs a place needs before it opens: enough for four options.
export const SIGNS_TO_OPEN = 4;
export const SIGN_OPTIONS = 4;

export type SignQuestion = {
  answer: Sign; // find this one: its meaning is the prompt
  options: Sign[]; // four signs from the place, the answer among them
};

// How a sign is read: でぐち is "deguchi", コーヒー "koohii". Empty for text the app can't
// split (the sign list is checked so that never happens).
export function signRomaji(text: string): string {
  const parts = splitWord(text);
  return parts ? wordRomaji(parts) : '';
}

// A place's signs written only with kana in `known` (the characters of the kana the learner
// has met, in either script). Small っ and ー don't need learning first.
export function readySigns(place: Place, known: ReadonlySet<string>): Sign[] {
  return place.signs.filter((sign) => {
    const parts = splitWord(sign.text);
    return parts !== null && parts.every((part) => isMark(part) || known.has(part.char));
  });
}

export function placeOpen(place: Place, known: ReadonlySet<string>): boolean {
  return readySigns(place, known).length >= SIGNS_TO_OPEN;
}

// A round of `length` questions from a place. Every ready sign is asked for once, in a
// shuffled order, before any comes back, and never the same one twice in a row. Nothing if
// the place isn't open.
export function signRound(place: Place, known: ReadonlySet<string>, rng: Rng, length: number): SignQuestion[] {
  const ready = readySigns(place, known);
  if (ready.length < SIGNS_TO_OPEN) return [];

  const answers: Sign[] = [];
  while (answers.length < length) {
    const deck = shuffle(ready, rng);
    // A new pass can't start with the sign the last one ended on.
    const first = deck[0];
    if (first && first === answers[answers.length - 1]) deck.push(...deck.splice(0, 1));
    answers.push(...deck);
  }

  return answers.slice(0, length).map((answer) => {
    const others = shuffle(
      ready.filter((s) => s !== answer),
      rng,
    ).slice(0, SIGN_OPTIONS - 1);
    return { answer, options: shuffle([answer, ...others], rng) };
  });
}
