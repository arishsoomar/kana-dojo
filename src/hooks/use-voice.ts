import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { ChosenVoice } from '@/audio/best-voice';
import { findJapaneseVoices, setChosenVoice } from '@/audio/pronounce';
import { setVoice } from '@/core/answers';

import { useProgress } from './use-progress';

// Tells the speech code which voice was chosen in Settings. It draws nothing; it's mounted
// once, in the root layout, so every word is spoken in that voice.
export function VoiceChoice() {
  const { progress } = useProgress();
  const voice = progress.settings.voice;
  useEffect(() => setChosenVoice(voice), [voice]);
  return null;
}

// The Japanese voices on this device and the one words are spoken in, looked up again whenever
// the app comes back to the front: that's when a newly downloaded voice would show up.
// `current` is undefined while looking.
export function useJapaneseVoices() {
  const { progress, updateProgress } = useProgress();
  const chosenId = progress.settings.voice;
  const [found, setFound] = useState<{ current: ChosenVoice | null; all: ChosenVoice[] } | undefined>(undefined);

  useEffect(() => {
    let live = true;
    const look = (fresh: boolean) => void findJapaneseVoices(fresh).then((v) => live && setFound(v));
    look(false);
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') look(true);
    });
    return () => {
      live = false;
      app.remove();
    };
  }, [chosenId]);

  return {
    current: found?.current,
    all: found?.all ?? [],
    // null: the best one there is.
    chosen: chosenId,
    choose: (id: string | null) => {
      setChosenVoice(id);
      updateProgress(setVoice(progress, id));
    },
  };
}
