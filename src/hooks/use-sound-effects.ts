import { playEffect, type SoundEffect } from '@/audio/effects';

import { useProgress } from './use-progress';

// Sound effects, played only when sound is on in settings (the same switch that mutes the
// spoken kana).
export function useSoundEffects() {
  const { progress } = useProgress();
  const on = progress.settings.sound;
  return {
    play(name: SoundEffect) {
      if (on) playEffect(name);
    },
  };
}
