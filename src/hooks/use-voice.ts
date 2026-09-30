import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { ChosenVoice } from '@/audio/best-voice';
import { findJapaneseVoice } from '@/audio/pronounce';

// The Japanese voice the app speaks with, looked up again whenever the app comes back to the
// front: that's when a newly downloaded voice would show up. Undefined while looking.
export function useJapaneseVoice(): ChosenVoice | null | undefined {
  const [voice, setVoice] = useState<ChosenVoice | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    const look = (fresh: boolean) => void findJapaneseVoice(fresh).then((v) => live && setVoice(v));
    look(false);
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') look(true);
    });
    return () => {
      live = false;
      app.remove();
    };
  }, []);
  return voice;
}
