import type { Progress } from './answers';
import { adjectiveKind, conjugateAdjective, conjugateVerb, verbKind, type AdjectiveForm, type VerbForm } from './conjugate';
import type { Furigana, FuriganaPiece } from './vocab';

// Grammar lessons: short explanations with examples, then exercises, in a Genki-like order.
// Lesson text is written with readings in brackets after the kanji they go over:
// 私[わたし]は学生[がくせい]です。 The lessons themselves are in src/content/grammar/.

// A sentence to show, with its translation.
export type Example = { ja: string; en: string };

export type Section = {
  title: string;
  text: string; // English, with Japanese inline in plain kana or kanji
  examples: readonly Example[];
};

// A form of a verb, or an adjective's form, plain or polite.
export type FormAsked = VerbForm | { adjective: AdjectiveForm; polite: boolean };

export type Exercise =
  // Choose what goes in the gap (＿), from a few: a particle, a word, a form.
  | { kind: 'choose'; prompt: string; en?: string; options: readonly string[]; answer: string; explain: string }
  // Put the pieces in order to say the English.
  | { kind: 'order'; en: string; pieces: readonly string[]; explain: string }
  // What does this mean?
  | { kind: 'meaning'; ja: string; options: readonly string[]; answer: string; explain: string }
  // Choose the right form of a word; the answer comes from the conjugation rules. The options
  // are in kana (たべます): kanji would need readings, and 来る's 来ます is read きます.
  | { kind: 'form'; word: string; reading: string; pos: readonly string[]; form: FormAsked; prompt: string; explain: string };

export type GrammarLesson = {
  id: string;
  unit: number;
  title: string;
  goal: string; // what you'll be able to say
  sections: readonly Section[];
  exercises: readonly Exercise[];
  words: readonly string[]; // deck words the lesson uses, as written (checked against the deck)
};

// --- Readings -----------------------------------------------------------------------------

const isKanji = (char: string) => /[㐀-鿿々〆ヶ]/.test(char);

// Lesson text as furigana pieces: a reading in brackets goes over the kanji just before it.
export function parseRuby(text: string): Furigana {
  const pieces: FuriganaPiece[] = [];
  let plain = '';
  let at = 0;
  while (at < text.length) {
    const open = text.indexOf('[', at);
    if (open < 0) {
      plain += text.slice(at);
      break;
    }
    const close = text.indexOf(']', open);
    let chunk = text.slice(at, open);
    // The kanji just before the bracket take the reading.
    let base = '';
    while (chunk.length > 0 && isKanji(chunk.slice(-1))) {
      base = chunk.slice(-1) + base;
      chunk = chunk.slice(0, -1);
    }
    plain += chunk;
    if (plain) pieces.push([plain]);
    plain = '';
    pieces.push([base, text.slice(open + 1, close)]);
    at = close + 1;
  }
  if (plain) pieces.push([plain]);
  return pieces;
}

// Lesson text without its readings: 私[わたし]は → 私は.
export function rubyText(text: string): string {
  return text.replace(/\[[^\]]*\]/g, '');
}

// --- Answers ------------------------------------------------------------------------------

function formOf(word: string, pos: readonly string[], form: FormAsked): string | null {
  return typeof form === 'string' ? conjugateVerb(word, pos, form) : conjugateAdjective(word, pos, form.adjective, form.polite);
}

// The right answer to an exercise: its choice, its pieces in order, or the conjugated form.
export function exerciseAnswer(exercise: Exercise): string | readonly string[] {
  if (exercise.kind === 'order') return exercise.pieces;
  if (exercise.kind === 'form') return formOf(exercise.reading, exercise.pos, exercise.form) ?? '';
  return exercise.answer;
}

export function checkAnswer(exercise: Exercise, answer: string | readonly string[]): boolean {
  const right = exerciseAnswer(exercise);
  if (typeof right === 'string') return answer === right;
  return Array.isArray(answer) && answer.length === right.length && answer.every((piece, i) => piece === right[i]);
}

const VERB_FORMS: readonly VerbForm[] = ['masu', 'masen', 'mashita', 'masendeshita', 'te', 'ta', 'nai', 'nakatta', 'dictionary'];
const ADJECTIVE_FORMS: readonly AdjectiveForm[] = ['present', 'negative', 'past', 'pastNegative', 'te'];

// Four options for a form: the right one, then the mistakes a learner makes: the word taken
// as the wrong kind (帰る as a る-verb: 帰ます; 高い as a な-adjective: 高いでした), then other
// forms of the same word. The right one is first; they're shuffled when shown.
export function formOptions(word: string, pos: readonly string[], form: FormAsked): string[] {
  const right = formOf(word, pos, form);
  if (!right) return [];
  const candidates: (string | null)[] = [right];

  if (typeof form === 'string') {
    // Other kinds of verb it could be mistaken for.
    const kinds = [['v1'], ['v5r'], ...(pos.includes('v5k-s') ? [['v5k']] : [])];
    for (const kind of kinds) candidates.push(conjugateVerb(word, kind, form));
    const stem = word.slice(0, -1);
    const masuStem = conjugateVerb(word, pos, 'masu')?.slice(0, -2) ?? stem;
    // The て and た forms: the wrong ending for the verb (よって, よいて for よんで), or て on the
    // ます stem (よみて).
    if (form === 'te' || form === 'ta') {
      const t = form === 'te' ? 'て' : 'た';
      const d = form === 'te' ? 'で' : 'だ';
      candidates.push(`${masuStem}${t}`, `${stem}っ${t}`, `${stem}ん${d}`, `${stem}い${t}`, `${stem}し${t}`);
    }
    // ない on the ます stem: のみない for のまない.
    if (form === 'nai' || form === 'nakatta') candidates.push(`${masuStem}${form === 'nai' ? 'ない' : 'なかった'}`);
    for (const other of VERB_FORMS) if (other !== form) candidates.push(conjugateVerb(word, pos, other));
  } else {
    const kind = adjectiveKind(pos);
    // An い-adjective taken as a な-adjective (高いでした), and the other way (静かかった).
    if (kind === 'i' || kind === 'ii') candidates.push(conjugateAdjective(word, ['adj-na'], form.adjective, form.polite));
    if (kind === 'ii') candidates.push(conjugateAdjective(word, ['adj-i'], form.adjective, form.polite));
    if (kind === 'na') candidates.push(conjugateAdjective(`${word}い`, ['adj-i'], form.adjective, form.polite));
    for (const other of ADJECTIVE_FORMS) if (other !== form.adjective) candidates.push(conjugateAdjective(word, pos, other, form.polite));
  }
  return [...new Set(candidates.filter((c): c is string => c !== null))].slice(0, 4);
}

// --- The path -----------------------------------------------------------------------------

// A finished lesson, as it's kept: its score is the exercises answered right.
export function grammarId(lessonId: string): string {
  return `grammar:${lessonId}`;
}

export function lessonDone(progress: Progress, lessonId: string): boolean {
  return progress.completed.some((c) => c.lesson === grammarId(lessonId));
}

export type LessonState = 'done' | 'current' | 'locked';

// Each lesson with its state: done, the current one (the first not done), or locked. Lessons
// open in order, each when the one before is done.
export function grammarPath(progress: Progress, lessons: readonly GrammarLesson[]): { lesson: GrammarLesson; state: LessonState }[] {
  let open = true;
  return lessons.map((lesson) => {
    if (lessonDone(progress, lesson.id)) return { lesson, state: 'done' };
    const state: LessonState = open ? 'current' : 'locked';
    open = false;
    return { lesson, state };
  });
}

// Whether a word is a verb or adjective the rules can conjugate, for checking lessons' form
// exercises.
export function canConjugate(pos: readonly string[]): boolean {
  return verbKind(pos) !== null || adjectiveKind(pos) !== null;
}
