import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useProgress } from './use-progress';

// The phone's taps and buzzes, by what they mean. Each does nothing when haptics are turned
// off in settings, or on the web (where the browser's vibration is patchy at best).
export function useHaptics() {
  const { progress } = useProgress();
  const on = progress.settings.haptics && Platform.OS !== 'web';

  return {
    // A right answer: a light tap.
    right() {
      if (on) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    // A wrong answer: a short double buzz.
    miss() {
      if (on) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    // Something landing: a lesson finishing, a seal stamping.
    thunk() {
      if (on) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    },
    // A big win: an exam passed, a duel won, a row opened.
    success() {
      if (on) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  };
}
