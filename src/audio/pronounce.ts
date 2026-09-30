import * as Speech from 'expo-speech';

import { KANA, type Kana } from '@/core/kana';

import { bestJapaneseVoice, type ChosenVoice } from './best-voice';

// The phone's best Japanese voice, looked up once and again whenever asked to (after the
// learner downloads a better one, say). Until it's found, the phone picks its default.
let voice: ChosenVoice | null = null;
let lookup: Promise<ChosenVoice | null> | null = null;

export function findJapaneseVoice(fresh = false): Promise<ChosenVoice | null> {
  if (!lookup || fresh) {
    lookup = Speech.getAvailableVoicesAsync()
      .then((voices) => (voice = bestJapaneseVoice(voices)))
      .catch(() => voice);
  }
  return lookup;
}

function speak(text: string, rate: number) {
  void findJapaneseVoice()
    .then(() => Speech.stop())
    .then(() => Speech.speak(text, { language: 'ja-JP', rate, ...(voice ? { voice: voice.identifier } : {}) }));
}

// Says a kana aloud with the phone's best Japanese voice, cutting off anything still being
// said. (On iOS nothing plays while the phone is on silent.) Recorded clips were tried instead
// and set aside; they're in the git history (commits 70f37bd to 475518e).
export function pronounce(kana: Kana) {
  speak(spokenForm(kana), RATE);
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

// Says a whole word or sentence aloud, a little slower than normal speech.
export function speakWord(text: string) {
  speak(text, WORD_RATE);
}

const WORD_RATE = 0.8;
