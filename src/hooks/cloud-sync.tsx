import { useEffect, useEffectEvent } from 'react';
import { AppState } from 'react-native';

import type { Progress } from '@/core/answers';
import { mergeProgress } from '@/core/merge';
import { serializeProgress } from '@/core/saved';
import { downloadProgress, isUploadPending, setUploadPending, uploadProgress } from '@/storage/progress-storage';

import { useAuth } from './use-auth';
import { useProgress } from './use-progress';

// Wait this long after the last change before uploading, so a burst of answers is one upload.
const UPLOAD_DELAY_MS = 2000;
// While an upload is still owed, try again this often.
const RETRY_MS = 30_000;

// Whether two copies hold the same training and settings, ignoring the order things are
// listed in (merging a copy with itself puts it in the merge's order).
function same(a: Progress, b: Progress): boolean {
  return serializeProgress(mergeProgress(a, a)) === serializeProgress(mergeProgress(b, b));
}

// Keeps this device and the signed-in learner's cloud copy in step. It draws nothing. The
// device's copy is always saved first (by the progress context). Each sync merges the cloud
// copy into it, so practice on another device shows up here, then uploads the result.
export function CloudSync() {
  const { userId } = useAuth();
  const { progress, updateProgress, currentProgress } = useProgress();

  // Downloads the cloud copy, merges it into this device's, and uploads the result unless
  // the cloud already has it all. If the cloud can't be reached, nothing is uploaded (so a
  // network error can never overwrite the account); it's retried later.
  const sync = useEffectEvent(async () => {
    if (!userId) return;
    const download = await downloadProgress(userId);
    if (!download.reached) {
      await setUploadPending(true);
      return;
    }
    const local = currentProgress();
    const merged = download.progress ? mergeProgress(local, download.progress) : local;
    if (!same(merged, local)) updateProgress(merged);
    if (download.progress && same(merged, download.progress)) {
      await setUploadPending(false);
      return;
    }
    const ok = await uploadProgress(userId, merged);
    await setUploadPending(!ok);
  });

  // Signing in is the first sync: whatever this device has joins what the account has.
  useEffect(() => {
    if (userId) void sync();
  }, [userId]);

  // Every change: note that an upload is owed, then upload once changes settle.
  useEffect(() => {
    if (!userId) return;
    void setUploadPending(true);
    const timer = setTimeout(() => void sync(), UPLOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [progress, userId]);

  // Coming back to the app syncs, to pick up practice done on another device meanwhile.
  // An upload that's still owed is also retried every so often.
  useEffect(() => {
    if (!userId) return;
    const retryIfOwed = async () => {
      if (await isUploadPending()) await sync();
    };
    const timer = setInterval(() => void retryIfOwed(), RETRY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [userId]);

  return null;
}
