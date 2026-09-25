import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Progress } from '@/core/answers';
import { parseProgress, serializeProgress } from '@/core/saved';

import { supabase } from './supabase';

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

// Cloud copies (Epic G). The device's copy above is always saved first; these keep a copy
// in the learner's row of the `progress` table, which row-level security keeps private.

const PENDING_KEY = 'kana-dojo/upload-pending';

// Uploads progress to the learner's row. Returns false if it didn't get there (for example,
// no connection), so it can be retried.
export async function uploadProgress(userId: string, progress: Progress): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('progress').upsert({
    user_id: userId,
    data: JSON.parse(serializeProgress(progress)),
    updated_at: new Date().toISOString(),
  });
  return !error;
}

// What a download found: the cloud couldn't be reached, or it could and held this copy
// (null when the account has no progress saved yet).
export type Download = { reached: false } | { reached: true; progress: Progress | null };

// The learner's cloud copy, checked the same way as a local save.
export async function downloadProgress(userId: string): Promise<Download> {
  if (!supabase) return { reached: false };
  const { data, error } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle();
  if (error) return { reached: false };
  return { reached: true, progress: data ? parseProgress(JSON.stringify(data.data)) : null };
}

// Whether a change hasn't reached the cloud yet. Kept on the device so it survives restarts.
export async function setUploadPending(pending: boolean): Promise<void> {
  try {
    if (pending) await AsyncStorage.setItem(PENDING_KEY, '1');
    else await AsyncStorage.removeItem(PENDING_KEY);
  } catch {
    // If this can't be recorded, the next change or app launch uploads anyway.
  }
}

export async function isUploadPending(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PENDING_KEY)) !== null;
  } catch {
    return false;
  }
}
