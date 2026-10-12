import { adjectiveKind, conjugateAdjective, conjugateVerb, verbKind } from '@/core/conjugate';
import { splitWord } from '@/core/forge';
import { furiganaReading, furiganaText, isTopic, TOPIC_IDS, type Furigana } from '@/core/vocab';

import { VOCAB } from './vocab';

// ヶ (as in 一ヶ月, ikkagetsu) is read like a kanji, so it counts as one.
const hasKanji = (text: string) => /[㐀-鿿々〆ヶヵ]/.test(text);
const isPiece = (p: unknown) =>
  Array.isArray(p) && (p.length === 1 || p.length === 2) && p.every((part) => typeof part === 'string' && part.length > 0);
const isFurigana = (f: unknown): f is Furigana => Array.isArray(f) && f.length > 0 && f.every(isPiece);

describe('the word deck', () => {
  it('has 2,500 frequent words and GENKI I\'s, each once, in frequency order', () => {
    expect(VOCAB.length).toBeGreaterThan(2500);
    expect(new Set(VOCAB.map((w) => w.id)).size).toBe(VOCAB.length);
    expect(new Set(VOCAB.map((w) => `${w.word}|${w.reading}`)).size).toBe(VOCAB.length);
    VOCAB.slice(1).forEach((w, i) => expect(w.rank).toBeGreaterThan(VOCAB[i]!.rank));
  });

  it('gives every word its meanings and parts of speech', () => {
    expect(VOCAB.filter((w) => w.meanings.length === 0 || w.meanings.some((m) => !m.trim())).map((w) => w.word)).toEqual([]);
    expect(VOCAB.filter((w) => w.pos.length === 0).map((w) => w.word)).toEqual([]);
  });

  it('reads every word with kana the app teaches (and っ or ー)', () => {
    expect(VOCAB.filter((w) => splitWord(w.reading) === null).map((w) => w.reading)).toEqual([]);
  });

  it("covers each word exactly with its furigana, and reads it as the word's reading", () => {
    const wrong = VOCAB.filter((w) => !isFurigana(w.furigana) || furiganaText(w.furigana) !== w.word || furiganaReading(w.furigana) !== w.reading);
    expect(wrong.map((w) => w.word)).toEqual([]);
  });

  it('puts a reading over every kanji, and none over kana', () => {
    const pieces = VOCAB.flatMap((w) => [...w.furigana, ...(w.example?.ja ?? [])]);
    expect(pieces.filter((p) => hasKanji(p[0]) && p[1] === undefined)).toEqual([]);
    expect(pieces.filter((p) => !hasKanji(p[0]) && p[1] !== undefined)).toEqual([]);
  });

  it('gives most words an example sentence, with a translation', () => {
    const examples = VOCAB.flatMap((w) => (w.example ? [w.example] : []));
    expect(examples.length).toBeGreaterThan(2000);
    expect(examples.filter((e) => !isFurigana(e.ja) || !e.en.trim())).toEqual([]);
  });

  it('tags words only with known topics, each topic with some words', () => {
    expect(VOCAB.filter((w) => !Array.isArray(w.topics) || !w.topics.every(isTopic)).map((w) => w.word)).toEqual([]);
    for (const topic of TOPIC_IDS) expect(VOCAB.filter((w) => w.topics.includes(topic)).length).toBeGreaterThan(5);
  });


  it('can conjugate every verb and adjective, in its writing and its reading', () => {
    const verbs = VOCAB.filter((w) => verbKind(w.pos));
    const adjectives = VOCAB.filter((w) => adjectiveKind(w.pos));
    expect(verbs.length).toBeGreaterThan(500);
    const broken = [
      ...verbs.filter((w) => !conjugateVerb(w.word, w.pos, 'masu') || !conjugateVerb(w.reading, w.pos, 'te')),
      ...adjectives.filter((w) => !conjugateAdjective(w.word, w.pos, 'past', true)),
    ];
    expect(broken.map((w) => w.word)).toEqual([]);
  });

  it('leaves out particles, and words that are only grammar', () => {
    const words = new Set(VOCAB.map((w) => w.word));
    for (const grammar of ['の', 'は', 'です', 'だ', 'んだ', 'という', 'でしょう']) expect(words.has(grammar)).toBe(false);
  });
});
