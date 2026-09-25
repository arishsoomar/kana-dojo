import * as Speech from 'expo-speech';

import { KANA, type Kana } from '@/core/kana';

// Says a kana aloud with the device's Japanese voice, cutting off anything still being said.
// (On iOS nothing plays while the phone is on silent.) To use recorded audio instead, only
// this file needs to change.
export function pronounce(kana: Kana) {
  // The katakana form is spoken even for hiragana: it sounds the same, and on its own は or
  // へ can be read as the particles "wa" and "e", while ハ and ヘ can't.
  const spoken = KANA.find((k) => k.script === 'katakana' && k.romaji[0] === kana.romaji[0])?.char ?? kana.char;
  void Speech.stop().then(() => Speech.speak(spoken, { language: 'ja-JP', rate: 0.8 }));
}
