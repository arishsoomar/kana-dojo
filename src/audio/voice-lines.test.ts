import { GENKI_CARDS } from '@/content/genki';
import { KANA } from '@/core/kana';
import { furiganaText } from '@/core/vocab';

import { kanaKey, kanaSpoken, voiceLines, VOICE_SAMPLE } from './voice-lines';

describe('what the app says aloud', () => {
  const keys = new Set(voiceLines().map((l) => l.key));

  it('has every kana, every flashcard word and its example sentence, and the voice sample', () => {
    expect(KANA.filter((k) => !keys.has(kanaKey(k))).map((k) => k.char)).toEqual([]);
    expect(GENKI_CARDS.filter((w) => !keys.has(w.reading)).map((w) => w.word)).toEqual([]);
    expect(GENKI_CARDS.filter((w) => w.example && !keys.has(furiganaText(w.example.ja))).map((w) => w.word)).toEqual([]);
    expect(keys.has(VOICE_SAMPLE)).toBe(true);
  });

  it('says each line once', () => {
    expect(keys.size).toBe(voiceLines().length);
  });

  it('holds a kana in katakana, so は is never read as the particle', () => {
    expect(kanaSpoken(KANA.find((k) => k.char === 'は')!)).toBe('ハー');
    expect(kanaSpoken(KANA.find((k) => k.char === 'ん')!)).toBe('ン');
  });
});
