import * as Speech from 'expo-speech';

import { KANA, type Kana } from '@/core/kana';

// Says a kana aloud with the device's Japanese voice, cutting off anything still being said.
// (On iOS nothing plays while the phone is on silent.) Recorded clips were tried instead and
// set aside; they're in the git history (commits 70f37bd to 475518e).
export function pronounce(kana: Kana) {
  void Speech.stop().then(() => Speech.speak(spokenForm(kana), { language: 'ja-JP', rate: RATE }));
}

// Speaking speed: 1 is normal. Slower makes a single kana easier to hear.
const RATE = 0.6;

// What's sent to the voice for a kana.
// - The katakana form, even for hiragana: it sounds the same, and on its own は or へ can be
//   read as the particles "wa" and "e", while ハ and ヘ can't.
// - With the long-vowel mark ー, so the sound is held ("aaa") the way a teacher says it
//   slowly, instead of clipped. ン has no vowel to hold, so it's left as it is.
function spokenForm(kana: Kana): string {
  const katakana = KANA.find((k) => k.script === 'katakana' && k.romaji[0] === kana.romaji[0])?.char ?? kana.char;
  return katakana === 'ン' ? katakana : `${katakana}ー`;
}
