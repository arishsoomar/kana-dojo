import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { Kana } from '@/core/kana';

import { CLIPS } from './clips';

// Says a kana aloud: a native speaker's recording of its sound, said three times (see
// assets/audio/kana/SOURCES.md). Hiragana and katakana with the same sound share a clip.

// One player per clip, made the first time it's needed and kept while the app runs: there
// are at most 46, each is tiny, and reusing them makes a replay start at once.
const players = new Map<string, AudioPlayer>();
let playing: AudioPlayer | null = null;
let modeSet = false;

export function pronounce(kana: Kana) {
  const sound = kana.romaji[0];
  const clip = CLIPS[sound];
  if (!clip) return;

  if (!modeSet) {
    modeSet = true;
    // Play even with the phone on silent (the app's own mute button is for turning it off),
    // and only lower, not stop, music from other apps while a clip plays.
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
  }

  // Cut off whatever is still playing, so two clips never overlap.
  playing?.pause();
  const existing = players.get(sound);
  if (existing) {
    // Rewind first, then play. Seeking takes a moment: playing without waiting for it starts
    // the clip, then jumps back to the start once the seek lands, so the first sound repeats.
    playing = existing;
    void existing.seekTo(0).then(() => {
      if (playing === existing) existing.play();
    });
    return;
  }
  // A new player is already at the start.
  const player = createAudioPlayer(clip);
  players.set(sound, player);
  player.play();
  playing = player;
}
