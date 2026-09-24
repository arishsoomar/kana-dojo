import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Progress } from '@/core/answers';
import { parseProgress, serializeProgress } from '@/core/saved';

const KEY = 'kana-dojo/progress';

// Reads saved progress. A new learner, or unreadable storage, gives empty progress.
export async function loadProgress(): Promise<Progress> {
  try {
    return parseProgress(await AsyncStorage.getItem(KEY));
  } catch (error) {
    console.warn('Could not read saved progress; starting fresh.', error);
    return parseProgress(null);
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, serializeProgress(progress));
  } catch (error) {
    // Nothing the learner can do about a failed save, so don't interrupt the lesson.
    console.warn('Could not save progress.', error);
  }
}
