import { useEffect } from 'react';

import { setChosenVoice, setSpeaker } from '@/audio/pronounce';

import { useProgress } from './use-progress';

// Tells the speech code which voices were chosen in Settings: the recorded voice, female or
// male, and the phone's voice for anything not recorded. It draws nothing; it's mounted once,
// in the root layout, so everything is spoken in them.
export function VoiceChoice() {
  const { progress } = useProgress();
  const { voice, speaker } = progress.settings;
  useEffect(() => setChosenVoice(voice), [voice]);
  useEffect(() => setSpeaker(speaker), [speaker]);
  return null;
}
