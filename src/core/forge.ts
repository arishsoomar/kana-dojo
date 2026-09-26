import { recordAnswer, type Progress } from './answers';
import { KANA, lookalikesOf, type Kana, type Script } from './kana';
import type { LessonAnswer } from './lesson';
import { shuffle, type Rng } from './random';
import { metKana } from './unlock';
import { WORDS, type Word } from './words';

// Word Forge: reading real words made of kana the learner has met. Each answer is fed back
// into the engine one kana at a time, so reading words is practice for the kana in them.

export const FORGE_ROUND = 10; // words in a round
export const FORGE_MIN_WORDS = 5; // ready words needed before Word Forge opens
export const FORGE_LESSON_ID = 'game:forge';

// A word with the kana it's made of.
export type ForgeWord = { word: Word; units: Kana[]; script: Script };

// The kana a word is written with, or null if it uses anything the app doesn't teach
// (like small っ or ー). A yōon like しゃ is two characters but one kana, so two-character
// kana are matched first.
export function splitWord(text: string): Kana[] | null {
  const units: Kana[] = [];
  let at = 0;
  while (at < text.length) {
    const found = KANA.find((k) => k.char.length === 2 && text.startsWith(k.char, at)) ?? KANA.find((k) => text.startsWith(k.char, at));
    if (!found) return null;
    units.push(found);
    at += found.char.length;
  }
  return units;
}

// A word's romaji: each kana's standard spelling, joined. しゃしん is "shashin".
export function wordRomaji(units: readonly Kana[]): string {
  return units.map((k) => k.romaji[0]).join('');
}

// Every word written entirely with kana the learner has met, in one script.
export function readyWords(progress: Progress, script: Script): ForgeWord[] {
  const known = new Set(metKana(progress, script).map((k) => k.char));
  return WORDS.flatMap((word) => {
    const units = splitWord(word.text);
    if (!units || units.some((k) => k.script !== script || !known.has(k.char))) return [];
    return [{ word, units, script }];
  });
}

// How a word was read, kana by kana. Only the kana that could be judged are listed: when a
// wrong option is picked, just the misread kana; when typing goes off into letters that
// spell nothing, the kana up to there. `guess` is the kana read in its place.
export type UnitResult = { kana: Kana; correct: boolean; guess: Kana | null };
export type Reading = { correct: boolean; units: UnitResult[] };

// All accepted spellings, longest first, of every kana in a script, for reading typed romaji.
function spellingsOf(script: Script): { kana: Kana; spelling: string }[] {
  return KANA.filter((k) => k.script === script)
    .flatMap((kana) => kana.romaji.map((spelling) => ({ kana, spelling })))
    .sort((a, b) => b.spelling.length - a.spelling.length);
}

// Checks typed romaji against a word, one kana at a time. Each kana is right if the typing
// continues with any of its spellings (so "susi" reads すし). If not, the kana whose spelling
// was typed there is its mix-up; if nothing matches, judging stops.
export function readTyped(word: ForgeWord, input: string): Reading {
  const typed = input.toLowerCase().replace(/\s+/g, '');
  const all = spellingsOf(word.script);
  const units: UnitResult[] = [];
  let at = 0;
  for (const kana of word.units) {
    const own = [...kana.romaji].sort((a, b) => b.length - a.length).find((s) => typed.startsWith(s, at));
    if (own !== undefined) {
      units.push({ kana, correct: true, guess: kana });
      at += own.length;
      continue;
    }
    const other = all.find(({ spelling }) => typed.startsWith(spelling, at));
    units.push({ kana, correct: false, guess: other?.kana ?? null });
    if (!other) break;
    at += other.spelling.length;
  }
  const correct = units.length === word.units.length && units.every((u) => u.correct) && at === typed.length;
  return { correct, units };
}

// A tap-mode option: some romaji, and which kana it misreads (null for the right answer).
export type ForgeOption = { romaji: string; misread: { index: number; as: Kana } | null };

const OPTION_COUNT = 4;

// The answer and up to three wrong options, each the word with one kana misread as another
// from `pool`: the kana's lookalikes first, then any other. Sorted alphabetically.
export function forgeOptions(word: ForgeWord, pool: readonly Kana[], rng: Rng): ForgeOption[] {
  const answer = wordRomaji(word.units);
  const options: ForgeOption[] = [{ romaji: answer, misread: null }];
  const used = new Set([answer]);
  // Which kana to misread: each position in turn, in a random order.
  const order = shuffle(word.units.map((_, i) => i), rng);

  for (let tries = 0; options.length < OPTION_COUNT && tries < order.length * OPTION_COUNT; tries++) {
    // Safe: the index is taken modulo the list's length.
    const index = order[tries % order.length]!;
    const kana = word.units[index]!;
    const lookalikes = lookalikesOf(kana.char);
    const inPool = pool.filter((k) => k !== kana && !k.romaji.some((r) => kana.romaji.includes(r)));
    const candidates = [...inPool.filter((k) => lookalikes.includes(k.char)), ...shuffle(inPool, rng)];
    for (const as of candidates) {
      const romaji = wordRomaji(word.units.map((k, i) => (i === index ? as : k)));
      if (used.has(romaji)) continue;
      options.push({ romaji, misread: { index, as } });
      used.add(romaji);
      break;
    }
  }
  return options.sort((a, b) => a.romaji.localeCompare(b.romaji));
}

// How a word was read from a tapped option: every kana right for the answer; otherwise only
// the misread kana, wrong.
export function readChosen(word: ForgeWord, option: ForgeOption): Reading {
  if (option.misread === null) return { correct: true, units: word.units.map((kana) => ({ kana, correct: true, guess: kana })) };
  const { index, as } = option.misread;
  // Safe: the index came from this word's own kana.
  return { correct: false, units: [{ kana: word.units[index]!, correct: false, guess: as }] };
}

// Records a reading: each judged kana through recordAnswer, with the word's time shared
// evenly between all its kana. Also returns the answers, for the end-of-round summary.
export function recordReading(
  progress: Progress,
  word: ForgeWord,
  reading: Reading,
  ms: number,
  now: number,
  typed: boolean,
): { progress: Progress; answers: LessonAnswer[] } {
  const each = Math.round(ms / word.units.length);
  let next = progress;
  const answers: LessonAnswer[] = [];
  for (const { kana, correct, guess } of reading.units) {
    next = recordAnswer(next, { char: kana.char, guess: correct ? kana.char : (guess?.char ?? null), ms: each, now, typed });
    answers.push({ char: kana.char, correct, ms: each });
  }
  return { progress: next, answers };
}

// A round: FORGE_ROUND words, shuffled. A short list is used more than once, but the same
// word never comes twice in a row (unless there's only one).
export function forgeRound(words: readonly ForgeWord[], rng: Rng): ForgeWord[] {
  const round: ForgeWord[] = [];
  while (round.length < FORGE_ROUND && words.length > 0) {
    let batch = shuffle(words, rng);
    if (batch.length > 1 && batch[0] === round[round.length - 1]) batch = [...batch.slice(1), batch[0]!];
    round.push(...batch);
  }
  return round.slice(0, FORGE_ROUND);
}
