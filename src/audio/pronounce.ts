import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { VOICE_CLIPS } from '@/constants/voice-clips';
import type { Speaker } from '@/core/answers';
import type { Kana } from '@/core/kana';
import { BENCH, benchLog } from '@/dev/bench';

import { voiceToUse, type DeviceVoice } from './best-voice';
import { setAppAudioMode } from './mode';
import { kanaKey, kanaSpoken } from './voice-lines';

// Japanese is spoken from recordings in VOICEVOX's voices (scripts/make-voices.mts), female or
// male as chosen in Settings. Anything not recorded is spoken by the phone's own voice instead.
let speaker: Speaker = 'female';

// The app's audio is set up as it starts, well before the first word is said.
setAppAudioMode();

// The voice chosen in Settings (see VoiceChoice in the root layout).
export function setSpeaker(next: Speaker) {
  speaker = next;
}

// One player for every recording, so a new one cuts off the last. It keeps the phone's audio
// session on between words: otherwise iOS turns it off after each one, and turning it back on
// for the next holds everything up for a moment (a flashcard freezing as it turns over).
let player: AudioPlayer | null = null;

// Whether the phone's voice has been used, so it may be speaking and need stopping. (Waking it
// just to stop it can hold things up too.)
let spoken = false;

// Plays the recording of a line in the chosen voice, if there is one.
function playRecording(key: string): boolean {
  const clip = VOICE_CLIPS[speaker][key];
  if (!clip) return false;
  if (spoken) void Speech.stop();
  benchLog({ ev: 'speak', via: 'recording', key });
  // If the player has broken (iOS can refuse it the sound for a moment, say when another app
  // has it), a new one gets a second try, and failing that the phone's voice says it: never
  // silence.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (player) {
        player.replace(clip);
      } else {
        setAppAudioMode();
        player = createAudioPlayer(clip, { keepAudioSessionActive: true, ...(BENCH ? { updateInterval: 20 } : {}) });
        if (BENCH) watchPlayer(player);
      }
      player.play();
      makeSureItPlays(player, 2);
      return true;
    } catch (error) {
      benchLog({ ev: 'audio-error', key, attempt, message: String(error) });
      // Let the broken one go for good (release stops it too, unlike remove).
      const broken = player;
      player = null;
      try {
        broken?.release();
      } catch {}
    }
  }
  return false;
}

// Now and then iOS leaves a word that's still loading paused instead of playing: told to play,
// it loads, then stops at the start without a sound (caught by the simulator benchmark, and the
// "some words don't play" on the phone). So each word is checked a moment later, and started
// again if it hasn't begun.
let playCheck: ReturnType<typeof setTimeout> | null = null;

function makeSureItPlays(checked: AudioPlayer, tries: number) {
  if (playCheck) clearTimeout(playCheck);
  playCheck = setTimeout(() => {
    playCheck = null;
    if (checked !== player || checked.playing || checked.currentTime > 0.05 || tries === 0) return;
    benchLog({ ev: 'audio-retry', tries });
    checked.play();
    makeSureItPlays(checked, tries - 1);
  }, 300);
}

// The benchmark's view of the player: when each word actually starts playing.
function watchPlayer(watched: AudioPlayer) {
  let playing = false;
  let last = '';
  watched.addListener('playbackStatusUpdate', (status) => {
    if (status.playing !== playing) benchLog({ ev: status.playing ? 'playing' : 'stopped' });
    playing = status.playing;
    // And every change in how the player is doing, to see why a word didn't play.
    const now = `${status.timeControlStatus}|${status.reasonForWaitingToPlay}|${status.isLoaded}|${status.playbackState}|${status.playbackRate}`;
    if (now !== last) benchLog({ ev: 'status', status: now, at: +status.currentTime.toFixed(2), of: +status.duration.toFixed(2) });
    last = now;
  });
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
  spoken = true;
  benchLog({ ev: 'speak', via: 'phone voice', key: text });
  // The phone's voice takes over: the last recording isn't to be started again.
  if (playCheck) clearTimeout(playCheck);
  playCheck = null;
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
