import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { setAppAudioMode } from './mode';

// The app's sound effects. They're made by scripts/make-sounds.mjs (plain maths, no
// recordings), so there's no licence to worry about.
const SOUNDS = {
  taiko: require('../../assets/audio/effects/taiko.wav'), // a lesson, duel or game ending
  gong: require('../../assets/audio/effects/gong.wav'), // a belt tied on
} as const;

export type SoundEffect = keyof typeof SOUNDS;

// One player per sound, made the first time it's needed and kept, so a replay starts at once.
const players = new Map<SoundEffect, AudioPlayer>();

export function playEffect(name: SoundEffect) {
  setAppAudioMode();

  const existing = players.get(name);
  if (existing) {
    // Rewind first, then play. Playing before the seek lands would start the sound, then
    // jump back and start it again.
    void existing.seekTo(0).then(() => existing.play());
    return;
  }
  // A new player is already at the start.
  const player = createAudioPlayer(SOUNDS[name]);
  players.set(name, player);
  player.play();
}

// The Taiko drill's song, "Tanuki matsuri" (also made by scripts/make-sounds.mjs, to the chart
// in src/core/taiko.ts). Plays from the start; the function it returns stops it.
export function playTaikoSong(): () => void {
  const player = createAudioPlayer(require('../../assets/audio/effects/taiko-song.wav'));
  player.play();
  return () => {
    player.pause();
    player.remove();
  };
}
