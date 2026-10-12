import { GENKI_CARDS } from '@/content/genki';
import { GRAMMAR_LESSONS } from '@/content/grammar';
import { PHRASES } from '@/content/phrases';
import { PLACES } from '@/content/signs';
import { VOCAB } from '@/content/vocab';
import { WORD_FAMILIES } from '@/content/word-families';
import { rubyText } from '@/core/grammar';
import { KANA, type Kana } from '@/core/kana';
import { phraseText } from '@/core/reading';
import { furiganaText } from '@/core/vocab';
import { WORDS } from '@/core/words';

// Everything the app says aloud, each line once: kana, the flashcards' words, their example
// sentences and word families, grammar examples, the reading room's signs and phrases, Word
// Forge's words, and the sample in Settings. scripts/make-voices.ts records each line in
// VOICEVOX's voices, and the app plays the recording (see pronounce.ts).
//
// `key` is what the app asks to hear: the text passed to speakWord (a word's reading, a
// sentence), or kana:<romaji> for a kana. `say` is what the voice is given: a word's written
// form, which tells it the word's pitch, when it reads it the same way. `reading` is how it
// must come out, to check that.
export type VoiceLine = { key: string; say: string; reading?: string };

// What Settings plays to try a voice.
export const VOICE_SAMPLE = 'こんにちは。日本語を勉強しています。';

export function kanaKey(kana: Kana): string {
  return `kana:${kana.romaji[0]}`;
}

// What's said for a kana.
// - The katakana form, even for hiragana: it sounds the same, and on its own は or へ can be
//   read as the particles "wa" and "e", while ハ and ヘ can't.
// - With the long-vowel mark ー, so the sound is held the way a teacher says it slowly,
//   instead of clipped. ン has no vowel to hold, so it's left as it is.
export function kanaSpoken(kana: Kana): string {
  const katakana = KANA.find((k) => k.script === 'katakana' && k.romaji[0] === kana.romaji[0])?.char ?? kana.char;
  return katakana === 'ン' ? katakana : `${katakana}ー`;
}

export function voiceLines(): VoiceLine[] {
  const lines = new Map<string, VoiceLine>();
  const add = (line: VoiceLine) => {
    if (line.key && !lines.has(line.key)) lines.set(line.key, line);
  };

  for (const kana of KANA) add({ key: kanaKey(kana), say: kanaSpoken(kana) });

  // The flashcards' words (GENKI's, and those the grammar lessons list), said from how they're
  // written (without a suffix's ～); their example sentences; and their word families.
  const grammarWords = new Set(GRAMMAR_LESSONS.flatMap((l) => l.words));
  const words = [...GENKI_CARDS, ...VOCAB.filter((w) => grammarWords.has(w.word))];
  for (const w of words) add({ key: w.reading, say: w.word.replace(/[～〜]/g, ''), reading: w.reading });
  for (const w of words) if (w.example) add({ key: furiganaText(w.example.ja), say: furiganaText(w.example.ja) });
  for (const family of WORD_FAMILIES) for (const m of family.members) add({ key: m.reading, say: m.word, reading: m.reading });

  for (const lesson of GRAMMAR_LESSONS)
    for (const section of lesson.sections) for (const example of section.examples) add({ key: rubyText(example.ja), say: rubyText(example.ja) });

  for (const place of PLACES) for (const sign of place.signs) add({ key: sign.text, say: sign.text });
  for (const phrase of PHRASES) add({ key: phraseText(phrase), say: phraseText(phrase) });
  for (const word of WORDS) add({ key: word.text, say: word.text });
  add({ key: VOICE_SAMPLE, say: VOICE_SAMPLE });

  return [...lines.values()];
}
