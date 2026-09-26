import { useSyncExternalStore } from 'react';

import type { RowId, Script } from '@/core/kana';

// News for the Learn wall: plaques just finished (their seal stamps down), rows just opened
// (their plaques flip over), and belt plaques just earned (Karasu flies in and hangs them). Lessons and games post it when they finish. The Learn screen reads
// it, plays it once it's in view (not underneath the lesson), and then clears it.

export type WallNews = {
  stamped: string[]; // plaque ids
  opened: { script: Script; row: RowId }[];
  hung: { script: Script; row: RowId }[]; // rows whose belt exam was just passed
};

export const NO_NEWS: WallNews = { stamped: [], opened: [], hung: [] };

// Kept for the life of the app, not saved: news only matters until the wall is next shown.
let pending: WallNews = NO_NEWS;
const listeners = new Set<() => void>();

function changed(next: WallNews) {
  pending = next;
  listeners.forEach((listener) => listener());
}

export function postWallNews(news: Partial<WallNews>) {
  if (!news.stamped?.length && !news.opened?.length && !news.hung?.length) return;
  changed({
    stamped: [...pending.stamped, ...(news.stamped ?? [])],
    opened: [...pending.opened, ...(news.opened ?? [])],
    hung: [...pending.hung, ...(news.hung ?? [])],
  });
}

export function clearWallNews() {
  if (pending !== NO_NEWS) changed(NO_NEWS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// The news waiting to be shown. The screen re-renders whenever it changes.
export function useWallNews(): WallNews {
  return useSyncExternalStore(subscribe, () => pending, () => NO_NEWS);
}
