import { setAudioModeAsync } from 'expo-audio';

let set = false;

// How the app's sound behaves, set once before anything plays: like a sound effect, quiet when
// the phone is on silent, and played over music from other apps instead of stopping it.
export function setAppAudioMode() {
  if (set) return;
  set = true;
  void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
}
