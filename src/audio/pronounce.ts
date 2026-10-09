import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { VOICE_CLIPS } from '@/constants/voice-clips';
import type { Speaker } from '@/core/answers';
import type { Kana } from '@/core/kana';

import { voiceToUse, type DeviceVoice } from './best-voice';
import { kanaKey, kanaSpoken } from './voice-lines';

// Japanese is spoken from recordings in VOICEVOX's voices (scripts/make-voices.mts), female or
// male as chosen in Settings. Anything not recorded is spoken by the phone's own voice instead.
let speaker: Speaker = 'female';

// The voice chosen in Settings (see VoiceChoice in the root layout).
export function setSpeaker(next: Speaker) {
  speaker = next;
}

// One player for every recording, so a new one cuts off the last.
let player: AudioPlayer | null = null;

// Plays the recording of a line in the chosen voice, if there is one.
function playRecording(key: string): boolean {
  const clip = VOICE_CLIPS[speaker][key];
  if (!clip) return false;
  void Speech.stop();
  if (player) player.replace(clip);
  else player = createAudioPlayer(clip);
  player.play();
  return true;
}

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

// The phone's voice chosen in Settings, or null for the best one: for anything not recorded.
export function setChosenVoice(id: string | null) {
  chosen = id;
}

function speak(text: string, rate: number) {
  player?.pause();
  void loadVoices(false)
    .then(() => Speech.stop())
    .then(() => {
      const voice = voiceToUse(voices, chosen);
      Speech.speak(text, { language: 'ja-JP', rate, ...(voice ? { voice: voice.identifier } : {}) });
    });
}

// Says a kana aloud, held a little the way a teacher says it slowly (see kanaSpoken).
export function pronounce(kana: Kana) {
  if (!playRecording(kanaKey(kana))) speak(kanaSpoken(kana), RATE);
}

// The phone voice's speaking speed: 1 is normal. Slower makes a single kana easier to hear.
const RATE = 0.6;

// Says a whole word or sentence aloud, a little slower than normal speech.
export function speakWord(text: string) {
  if (!playRecording(text)) speak(text, WORD_RATE);
}

const WORD_RATE = 0.8;
