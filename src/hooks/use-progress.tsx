import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Progress } from '@/core/answers';
import { loadProgress, saveProgress } from '@/storage/progress-storage';

type ProgressContextValue = {
  progress: Progress;
  // Replaces the learner's progress and saves it to the device.
  updateProgress: (next: Progress) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

// Loads saved progress once, when the app starts. Null until it has loaded.
export function useSavedProgress(): Progress | null {
  const [saved, setSaved] = useState<Progress | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProgress().then((progress) => {
      if (!cancelled) setSaved(progress);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return saved;
}

// Makes the learner's progress available to every screen below it.
export function ProgressProvider({ initial, children }: { initial: Progress; children: ReactNode }) {
  const [progress, setProgress] = useState(initial);

  function updateProgress(next: Progress) {
    setProgress(next);
    void saveProgress(next);
  }

  return <ProgressContext value={{ progress, updateProgress }}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
