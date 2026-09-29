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
  return askAll(ready, rng, length).map((answer) => ({ answer, options: withOthers(answer, ready, rng) }));
}

// Phrases: short everyday Japanese, with spaces between words as in beginners' books. A few
// kana are read differently when they're particles, the little words that mark a word's
// role: は is read "wa", へ "e", and を "o". Nothing in the kana shows which は is a particle
// (はな, flower, is "hana"), so the phrase list marks them in brackets: みず[を] ください.

export type Phrase = {
  text: string; // with particles in brackets: トイレ[は] どこ ですか
  meaning: string;
};

export type Particle = 'は' | 'へ' | 'を';

export const PARTICLE_READINGS: Readonly<Record<Particle, string>> = { は: 'wa', へ: 'e', を: 'o' };

export const PARTICLE_NOTES: Readonly<Record<Particle, string>> = {
  は: 'As a particle, は is read "wa". It marks what the sentence is about.',
  へ: 'As a particle, へ is read "e". It means "to" a place.',
  を: 'を is read "o". It marks what something is done to.',
};

// A piece of a phrase's romaji. Particles are picked out, so they can be shown apart.
export type RomajiPiece = { text: string; particle: boolean };

const PARTICLE = /\[([はへを])\]/g;

function isParticle(char: string): char is Particle {
  return char === 'は' || char === 'へ' || char === 'を';
}

// The phrase as it's written: みず[を] ください is みずを ください.
export function phraseText(phrase: Phrase): string {
  return phrase.text.replace(PARTICLE, '$1');
}

// How a phrase is read, in pieces: "mizu", " o" (a particle), " kudasai". Particles are
// their own word in romaji, unless the phrase is a single word (こんにちは is "konnichiwa").
export function phraseRomaji(phrase: Phrase): RomajiPiece[] {
  const oneWord = !phrase.text.includes(' ');
  const pieces: RomajiPiece[] = [];
  const words = phrase.text.split(' ');
  words.forEach((word, w) => {
    if (w > 0) pieces.push({ text: ' ', particle: false });
    // Split the word around its particles: "みず", "[を]".
    for (const run of word.split(/(\[[はへを]\])/).filter(Boolean)) {
      const char = run.slice(1, -1);
      if (run.startsWith('[') && isParticle(char)) {
        if (!oneWord) pieces.push({ text: ' ', particle: false });
        pieces.push({ text: PARTICLE_READINGS[char], particle: true });
      } else {
        pieces.push({ text: signRomaji(run), particle: false });
      }
    }
  });
  return pieces;
}

// The particles a phrase uses, each once, in order.
export function phraseParticles(phrase: Phrase): Particle[] {
  const found = [...phrase.text.matchAll(PARTICLE)].map((m) => m[1] ?? '').filter(isParticle);
  return [...new Set(found)];
}

// Phrases written only with kana in `known`, particles included.
export function readyPhrases(phrases: readonly Phrase[], known: ReadonlySet<string>): Phrase[] {
  return phrases.filter((phrase) =>
    phraseText(phrase)
      .split(' ')
      .every((word) => {
        const parts = splitWord(word);
        return parts !== null && parts.every((part) => isMark(part) || known.has(part.char));
      }),
  );
}

export type PhraseQuestion = {
  answer: Phrase; // read this one
  options: Phrase[]; // four phrases, the answer among them: their meanings are the choices
};

// A round of "what does this mean?": every ready phrase once, shuffled, before any comes back,
// never the same twice in a row. Nothing until there are enough for four choices.
export function phraseRound(phrases: readonly Phrase[], known: ReadonlySet<string>, rng: Rng, length: number): PhraseQuestion[] {
  const ready = readyPhrases(phrases, known);
  return askAll(ready, rng, length).map((answer) => ({ answer, options: withOthers(answer, ready, rng) }));
}

// `length` picks from `items`: each once in a shuffled order before any comes back, and never
// the same twice in a row. Nothing if there are too few for four options.
function askAll<T>(items: readonly T[], rng: Rng, length: number): T[] {
  if (items.length < SIGN_OPTIONS) return [];
  const picked: T[] = [];
  while (picked.length < length) {
    const deck = shuffle(items, rng);
    // A new pass can't start with the one the last pass ended on.
    const first = deck[0];
    if (first !== undefined && first === picked[picked.length - 1]) deck.push(...deck.splice(0, 1));
    picked.push(...deck);
  }
  return picked.slice(0, length);
}

// The answer and three others, shuffled.
function withOthers<T>(answer: T, items: readonly T[], rng: Rng): T[] {
  const others = shuffle(
    items.filter((i) => i !== answer),
    rng,
  ).slice(0, SIGN_OPTIONS - 1);
  return shuffle([answer, ...others], rng);
}
