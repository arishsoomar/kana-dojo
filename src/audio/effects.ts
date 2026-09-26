import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// The app's sound effects. They're made by scripts/make-sounds.mjs (plain maths, no
// recordings), so there's no licence to worry about.
const SOUNDS = {
  taiko: require('../../assets/audio/effects/taiko.wav'), // a lesson, duel or game ending
  gong: require('../../assets/audio/effects/gong.wav'), // a belt tied on
} as const;

export type SoundEffect = keyof typeof SOUNDS;

// One player per sound, made the first time it's needed and kept, so a replay starts at once.
const players = new Map<SoundEffect, AudioPlayer>();
let modeSet = false;

export function playEffect(name: SoundEffect) {
  if (!modeSet) {
    modeSet = true;
    // Like any sound effect: quiet when the phone is on silent, and played over music from
    // other apps instead of stopping it.
    void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
  }

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
