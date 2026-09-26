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

// A mark in a word that isn't a sound of its own, but changes the kana beside it:
// - double: small っ (ッ in katakana) doubles the next consonant: きって is kitte
// - long: ー stretches the vowel before it: コーヒー is koohii
export type Mark = { char: string; mark: 'double' | 'long' };
const MARKS: readonly Mark[] = [
  { char: 'っ', mark: 'double' },
  { char: 'ッ', mark: 'double' },
  { char: 'ー', mark: 'long' },
];

// One piece of a word: a kana, or a mark.
export type Part = Kana | Mark;

export function isMark(part: Part): part is Mark {
  return 'mark' in part;
}

// A word with its parts (kana and marks, in order), just its kana (`units`), and its script.
export type ForgeWord = { word: Word; parts: Part[]; units: Kana[]; script: Script };

// The kana and marks a word is written with, or null if it uses anything else. A yōon like
// しゃ is two characters but one kana, so two-character kana are matched first. A mark must
// have a kana to change: っ needs one after it, and ー one before it.
export function splitWord(text: string): Part[] | null {
  const parts: Part[] = [];
  let at = 0;
  while (at < text.length) {
    const found =
      KANA.find((k) => k.char.length === 2 && text.startsWith(k.char, at)) ??
      KANA.find((k) => text.startsWith(k.char, at)) ??
      MARKS.find((m) => text.startsWith(m.char, at));
    if (!found) return null;
    parts.push(found);
    at += found.char.length;
  }
  const ok = parts.every((part, i) => {
    if (!isMark(part)) return true;
    const neighbour = part.mark === 'double' ? parts[i + 1] : parts[i - 1];
    return neighbour !== undefined && !isMark(neighbour);
  });
  return ok ? parts : null;
}

// A word as a ForgeWord, or null if it can't be split.
export function forgeWord(word: Word): ForgeWord | null {
  const parts = splitWord(word.text);
  const units = parts?.filter((p): p is Kana => !isMark(p)) ?? [];
  const script = units[0]?.script;
  return parts && script ? { word, parts, units, script } : null;
}

// How a mark is spelled, from the kana beside it: っ is the next kana's first letter (t
// before ch, as in matcha); ー is the last letter (the vowel) of the kana before it.
function markSpelling(parts: readonly Part[], i: number): string {
  const part = parts[i];
  if (!part || !isMark(part)) return '';
  const beside = parts[part.mark === 'double' ? i + 1 : i - 1];
  if (!beside || isMark(beside)) return '';
  const spelling = beside.romaji[0];
  if (part.mark === 'long') return spelling.slice(-1);
  return spelling.startsWith('ch') ? 't' : spelling.charAt(0);
}

// A word's romaji: each kana's standard spelling and each mark's, joined. しゃしん is
// "shashin", きって "kitte", コーヒー "koohii".
export function wordRomaji(parts: readonly Part[]): string {
  return parts.map((part, i) => (isMark(part) ? markSpelling(parts, i) : part.romaji[0])).join('');
}

// Every word written entirely with kana the learner has met, in one script. Marks don't
// need learning first.
export function readyWords(progress: Progress, script: Script): ForgeWord[] {
  const known = new Set(metKana(progress, script).map((k) => k.char));
  return WORDS.flatMap((word) => {
    const found = forgeWord(word);
    if (!found || found.script !== script || found.units.some((k) => !known.has(k.char))) return [];
    return [found];
  });
}

// How a word was read, kana by kana. Only the kana that could be judged are listed: when a
// wrong option is picked, just the misread kana; when typing goes off into letters that
// spell nothing, the kana up to there. `guess` is the kana read in its place. `missedMark`
// is the first っ or ー that was read wrong (or left out), if any.
export type UnitResult = { kana: Kana; correct: boolean; guess: Kana | null };
export type Reading = { correct: boolean; units: UnitResult[]; missedMark: Mark | null };

// All accepted spellings, longest first, of every kana in a script, for reading typed romaji.
function spellingsOf(script: Script): { kana: Kana; spelling: string }[] {
  return KANA.filter((k) => k.script === script)
    .flatMap((kana) => kana.romaji.map((spelling) => ({ kana, spelling })))
    .sort((a, b) => b.spelling.length - a.spelling.length);
}

// The letters a mark may be typed as at this point: its spelling, plus "c" for っ before ch
// (maccha) and "-" for ー (ko-hi-).
function markTypings(parts: readonly Part[], i: number): string[] {
  const part = parts[i];
  if (!part || !isMark(part)) return [];
  const spelling = markSpelling(parts, i);
  if (part.mark === 'long') return [spelling, '-'];
  return spelling === 't' && (parts[i + 1] as Kana | undefined)?.romaji[0].startsWith('ch') ? ['t', 'c'] : [spelling];
}

// Checks typed romaji against a word, one part at a time. Each kana is right if the typing
// continues with any of its spellings (so "susi" reads すし). If not, the kana whose spelling
// was typed there is its mix-up; if nothing matches, judging stops. A mark is right if its
// letter comes next; if not, it was missed, and reading goes on from the same place.
export function readTyped(word: ForgeWord, input: string): Reading {
  const typed = input.toLowerCase().replace(/\s+/g, '');
  const all = spellingsOf(word.script);
  const units: UnitResult[] = [];
  let missedMark: Mark | null = null;
  let at = 0;
  for (const [i, part] of word.parts.entries()) {
    if (isMark(part)) {
      // A doubling っ only counts when the next kana follows straight after its extra letter:
      // "kitte" has it, but "kite" just starts て early.
      const next = word.parts[i + 1];
      const follows = (t: string) =>
        part.mark === 'long' || (next !== undefined && !isMark(next) && next.romaji.some((s) => typed.startsWith(s, at + t.length)));
      const typing = markTypings(word.parts, i).find((t) => t !== '' && typed.startsWith(t, at) && follows(t));
      if (typing !== undefined) at += typing.length;
      else missedMark ??= part;
      continue;
    }
    const own = [...part.romaji].sort((a, b) => b.length - a.length).find((s) => typed.startsWith(s, at));
    if (own !== undefined) {
      units.push({ kana: part, correct: true, guess: part });
      at += own.length;
      continue;
    }
    const other = all.find(({ spelling }) => typed.startsWith(spelling, at));
    units.push({ kana: part, correct: false, guess: other?.kana ?? null });
    if (!other) break;
    at += other.spelling.length;
  }
  const correct =
    missedMark === null && units.length === word.units.length && units.every((u) => u.correct) && at === typed.length;
  return { correct, units, missedMark };
}

// A tap-mode option: some romaji, and what's wrong with it: which kana it misreads, or which
// mark it leaves out (by its place in the word's parts). Neither for the right answer.
export type ForgeOption = { romaji: string; misread: { index: number; as: Kana } | null; dropsMark?: number };

const OPTION_COUNT = 4;

// The answer and up to three wrong options. A word with a mark first gets the word with that
// mark left out (kite for きって), the most common slip. The rest each misread one kana as
// another from `pool`: the kana's lookalikes first, then any other. Sorted alphabetically.
export function forgeOptions(word: ForgeWord, pool: readonly Kana[], rng: Rng): ForgeOption[] {
  const answer = wordRomaji(word.parts);
  const options: ForgeOption[] = [{ romaji: answer, misread: null }];
  const used = new Set([answer]);

  const markAt = word.parts.findIndex(isMark);
  if (markAt >= 0) {
    const romaji = wordRomaji(word.parts.filter((_, i) => i !== markAt));
    if (!used.has(romaji)) {
      options.push({ romaji, misread: null, dropsMark: markAt });
      used.add(romaji);
    }
  }

  // Which kana to misread: each kana's position in turn, in a random order.
  const kanaAt = word.parts.flatMap((part, i) => (isMark(part) ? [] : [i]));
  const order = shuffle(kanaAt, rng);
  for (let tries = 0; options.length < OPTION_COUNT && tries < order.length * OPTION_COUNT; tries++) {
    // Safe: the index is taken modulo the list's length, and points at a kana.
    const index = order[tries % order.length]!;
    const kana = word.parts[index] as Kana;
    const lookalikes = lookalikesOf(kana.char);
    const inPool = pool.filter((k) => k !== kana && !k.romaji.some((r) => kana.romaji.includes(r)));
    const candidates = [...inPool.filter((k) => lookalikes.includes(k.char)), ...shuffle(inPool, rng)];
    for (const as of candidates) {
      const romaji = wordRomaji(word.parts.map((p, i) => (i === index ? as : p)));
      if (used.has(romaji)) continue;
      options.push({ romaji, misread: { index, as } });
      used.add(romaji);
      break;
    }
  }
  return options.sort((a, b) => a.romaji.localeCompare(b.romaji));
}

// How a word was read from a tapped option: every kana right for the answer; the missed mark
// for an option that leaves one out; otherwise only the misread kana, wrong.
export function readChosen(word: ForgeWord, option: ForgeOption): Reading {
  if (option.dropsMark !== undefined) {
    // Safe: the index came from this word's own marks.
    return { correct: false, units: [], missedMark: word.parts[option.dropsMark] as Mark };
  }
  if (option.misread === null) {
    return { correct: true, units: word.units.map((kana) => ({ kana, correct: true, guess: kana })), missedMark: null };
  }
  const { index, as } = option.misread;
  // Safe: the index came from this word's own kana.
  return { correct: false, units: [{ kana: word.parts[index] as Kana, correct: false, guess: as }], missedMark: null };
}

// Records a reading: each judged kana through recordAnswer, with the word's time shared
// evenly between all its kana. Marks have no belt of their own, so they aren't recorded.
// Also returns the answers, for the end-of-round summary.
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
