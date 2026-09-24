import { useEffect, useEffectEvent } from 'react';
import { AppState } from 'react-native';

import { isEmptyProgress } from '@/core/answers';
import { downloadProgress, isUploadPending, setUploadPending, uploadProgress } from '@/storage/progress-storage';

import { useAuth } from './use-auth';
import { useProgress } from './use-progress';

// Wait this long after the last change before uploading, so a burst of answers is one upload.
const UPLOAD_DELAY_MS = 2000;
// While an upload is still owed, try again this often.
const RETRY_MS = 30_000;

// Keeps the signed-in learner's cloud copy up to date. It draws nothing. The device's copy
// is always saved first (by the progress context); this only mirrors it to the cloud.
export function CloudSync() {
  const { userId } = useAuth();
  const { progress, updateProgress, currentProgress } = useProgress();

  // Uploads the latest progress; if it fails, remembers that an upload is still owed.
  const upload = useEffectEvent(async () => {
    if (!userId) return;
    const ok = await uploadProgress(userId, currentProgress());
    await setUploadPending(!ok);
  });

  // On signing in: a device with no progress yet takes the cloud copy. Otherwise the device's
  // copy is kept and uploaded. (Merging two copies properly comes in G3.)
  const onSignIn = useEffectEvent(async (id: string) => {
    const cloud = await downloadProgress(id);
    if (cloud && !isEmptyProgress(cloud) && isEmptyProgress(currentProgress())) {
      updateProgress({ ...cloud, settings: currentProgress().settings });
    } else {
      await upload();
    }
  });

  useEffect(() => {
    if (userId) void onSignIn(userId);
  }, [userId]);

  // Every change: note that an upload is owed, then upload once changes settle.
  useEffect(() => {
    if (!userId) return;
    void setUploadPending(true);
    const timer = setTimeout(() => void upload(), UPLOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [progress, userId]);

  // Retry an owed upload when the app comes back to the foreground, and every so often.
  useEffect(() => {
    if (!userId) return;
    const retryIfOwed = async () => {
      if (await isUploadPending()) await upload();
    };
    void retryIfOwed();
    const timer = setInterval(() => void retryIfOwed(), RETRY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void retryIfOwed();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [userId]);

  return null;
}
