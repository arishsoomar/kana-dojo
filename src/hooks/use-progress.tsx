import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { Progress } from '@/core/answers';
import { loadProgress, saveProgress } from '@/storage/progress-storage';

type ProgressContextValue = {
  progress: Progress;
  // Replaces the learner's progress and saves it to the device.
  updateProgress: (next: Progress) => void;
  // Updates progress from its latest value. Use this when several changes can happen
  // before the screen redraws (like a game loop), so none of them is lost.
  changeProgress: (change: (current: Progress) => Progress) => void;
  // The latest progress, for code that runs outside rendering (like a game loop).
  currentProgress: () => Progress;
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
  // The latest progress, which may be ahead of `progress` until the next render.
  const latest = useRef(initial);

  function updateProgress(next: Progress) {
    latest.current = next;
    setProgress(next);
    void saveProgress(next);
  }

  function changeProgress(change: (current: Progress) => Progress) {
    updateProgress(change(latest.current));
  }

  function currentProgress() {
    return latest.current;
  }

  return (
    <ProgressContext value={{ progress, updateProgress, changeProgress, currentProgress }}>{children}</ProgressContext>
  );
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
