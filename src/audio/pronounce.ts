import * as Speech from 'expo-speech';

import { KANA, type Kana } from '@/core/kana';

import { japaneseVoices, voiceToUse, type ChosenVoice, type DeviceVoice } from './best-voice';

// The phone's voices, looked up once and again whenever asked to (after the learner downloads
// a better one, say), and the voice to speak with: the one chosen in Settings while it's
// installed, or else the best Japanese one. Until they're found, the phone picks its default.
let voices: readonly DeviceVoice[] = [];
let chosen: string | null = null;
let lookup: Promise<readonly DeviceVoice[]> | null = null;

function loadVoices(fresh: boolean): Promise<readonly DeviceVoice[]> {
  if (!lookup || fresh) {
    lookup = Speech.getAvailableVoicesAsync()
      .then((found) => (voices = found))
      .catch(() => voices);
  }
  return lookup;
}

// The voice chosen in Settings (see VoiceChoice in the root layout), or null for the best one.
export function setChosenVoice(id: string | null) {
  chosen = id;
}

// The voice words are spoken in now, and every Japanese voice there is to choose from.
export async function findJapaneseVoices(fresh = false): Promise<{ current: ChosenVoice | null; all: ChosenVoice[] }> {
  const found = await loadVoices(fresh);
  return { current: voiceToUse(found, chosen), all: japaneseVoices(found) };
}

function speak(text: string, rate: number) {
  void loadVoices(false)
    .then(() => Speech.stop())
    .then(() => {
      const voice = voiceToUse(voices, chosen);
      Speech.speak(text, { language: 'ja-JP', rate, ...(voice ? { voice: voice.identifier } : {}) });
    });
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
