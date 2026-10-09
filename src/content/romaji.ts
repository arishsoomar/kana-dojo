import { hepburn } from '@/core/hepburn';
import type { VocabWord } from '@/core/vocab';

// How a word is said, in romaji, for English readers: おはようございます is "ohayō gozaimasu".
// Worked out from the reading (src/core/hepburn.ts), except where that can't know: phrases,
// written with a space between their words; は read "wa" as a particle (こんにちは); and words
// made of two whose sounds meet (みずうみ is mizu + umi, not mizūmi). By reading.
const SAID: Readonly<Record<string, string>> = {
  おはようございます: 'ohayō gozaimasu',
  こんにちは: 'konnichiwa',
  こんばんは: 'konbanwa',
  おやすみなさい: 'oyasumi nasai',
  ありがとうございます: 'arigatō gozaimasu',
  いってきます: 'itte kimasu',
  いってらっしゃい: 'itte rasshai',
  おかえりなさい: 'okaeri nasai',
  ごちそうさまでした: 'gochisōsama deshita',
  よろしくおねがいします: 'yoroshiku onegai shimasu',
  ごめんなさい: 'gomen nasai',
  ひとりで: 'hitori de',
  いっしょに: 'issho ni',
  あとで: 'ato de',
  つれてくる: 'tsurete kuru',
  もってくる: 'motte kuru',
  もっていく: 'motte iku',
  おとこのひと: 'otoko no hito',
  おんなのひと: 'onna no hito',
  きをつける: 'ki o tsukeru',
  みずうみ: 'mizuumi',
};

export function romajiOf(word: VocabWord): string {
  // A verb ending in う (思う, omou): its う is a sound of its own.
  const verbU = word.pos.some((p) => p === 'v5u' || p === 'v5u-s');
  return SAID[word.reading] ?? hepburn(word.reading, { verbU }) ?? '';
}
